'use strict';

require('es6-shim');

var http=require('http')
  , join=require('path').join
  , _error=require('../core/json-response').error
  , express=require('express')
  , morgan=require('morgan')
  , lessmiddleware=require('less-middleware')
  , favicon=require('serve-favicon')
  , csurf=require('csurf')
  , bodyparser=require('body-parser')
  , cookieparser=require('cookie-parser')
  , cookiesession=require('express-session')
  , redis=require('redis')
  , redisstore=require('connect-redis')(cookiesession)
  , passport=require('passport')
  , localstrategy=require('passport-local').Strategy
  , mongoose=require('mongoose')
  , User=require('./master/models/user')
  , app=express()
  , server=http.createServer(app)
  , ios=require('socket.io')(server)
  , sessionsocketio=require('session.socket.io')
  , config=require('../config/master');

if(process.env.ENV=='test'){
    config=require('../config/tests');
}

var redisclient=redis.createClient(
    config.redis.port,config.redis.host,config.redis.options)
redisclient.on('error',console.error.bind(console,'redis connection error:'));
redisclient.on('ready',function(){
    console.log('connection to redis db:',
        config.redis.host,':',config.redis.port);
});
var store=new redisstore({
    client:redisclient
  , host:config.redis.host
  , port:config.redis.port
  , prefix:config.redis.prefix
});

mongoose.connect(config.master.mongo);
var mongodb=mongoose.connection;
mongodb.on('error',console.error.bind(console,'mongo connection error:'));
mongodb.once('open',function(){
    console.log('connection to mongo db:',config.master.mongo);
});

passport.serializeUser(function(user,done){
    done(null,user.id);
});
passport.deserializeUser(function(id,done){
    if(config.master.admin&&id===0){
        done(null,{
            id:0
          , email:config.master.email
          , resources:{
                dbservers:[]
              , repositories:[]
              , planners:[]
              , notifiers:[]
            }
          , projects:[]
          , notifier:[]
        });
    }else{
        User.findById(id,function(err,user){
            done(err,user);
        });
    }
});
passport.use(new localstrategy({
    usernameField:'email'
  , passwordField:'password'
  , passReqToCallback:true
},function(request,email,password,done){
    if(config.master.admin){
        if(email===config.master.email){
            if(password===config.master.password){
                return done(null,{
                    id:0
                  , email:config.master.email
                });
            }else{
                return done(null,false,_error.invalidaccount);
            }
        }
    }

    User.findOne({
        email:email
    },function(err,user){
        if(err){
            return done(err);
        }
        if(!user){
            return done(null,false,_error.invalidaccount);
        }
        switch(user.status.type){
            case 'confirm':
                return done(null,false,_error.notconfirmed);
                break;
            case 'forgot':
            case 'active':
                user.comparePassword(password,function(err,match){
                    if(err){
                        return done(err);
                    }
                    if(match){
                        return done(null,user);
                    }else{
                        return done(null,false,_error.invalidaccount);
                    }
                });
                break;
            default:
                return done(null,false,_error.inactiveaccount);
        }
    });
}));

var sockets={}
  , parser=cookieparser(config.cookie.secret)
  , sessionsockets=new sessionsocketio(ios,store,parser,config.cookie.name)
  , notifier=function(id,msg){
        for(var i in sockets[id]){
            sockets[id][i].emit('notifier',msg);
        }
    }

sessionsockets.on('connection',function(err,socket,session){
    var sid=socket.handshake.signedCookies[config.cookie.name];
    if(!(sid in sockets)){
        sockets[sid]={};
    }

    sockets[sid][socket.id]=socket;
    socket.on('disconnect',function(){
        delete sockets[sid][socket.id];

        if(Object.keys(sockets[sid]).length==0){
            delete sockets[sid];
        }
    });
});

app.set('host',config.master.host);
app.set('port',config.master.port);
app.disable('x-powered-by');

app.use(favicon(join(__dirname,'..','client','favicon.ico')));
app.use(parser);
app.use(bodyparser.json({limit:'5mb'}));
app.use(cookiesession({
    cookie:{
        path:'/'
      , httpOnly:true
      , secure:false
      , maxAge:config.cookie.maxAge
    }
  , name:config.cookie.name
  , resave:false
  , saveUninitialized:false
  , secret:config.cookie.secret
  , store:store
}));
app.use(passport.initialize());
app.use(passport.session());

if(config.env=='production'){
    app.set('views',join(__dirname,'..','views'));
    app.set('view engine','jade');

    app.use(express.static(join(__dirname,'..','client')));
    app.locals.pretty=false;

    app.use(morgan('combined'));
}else{
    app.set('views',join(__dirname,'..','client','views','master'));
    app.set('view engine','jade');

    app.use(lessmiddleware('/less',{
        dest:'/css'
      , pathRoot:join(__dirname,'..','client')
      , compress:true
    }));

    app.use(express.static(join(__dirname,'..','client')));
    app.use(express.static(join(__dirname,'..','bower_components')));
    app.locals.pretty=true;

    app.use(morgan('dev'));
}

app.set('redis',redisclient);
app.set('passport',passport);
app.set('auth',function(request,response,next){
    if(request.isAuthenticated()){
        return next();
    }

    response.status(401)
        .cookie('pleni.mastr.auth',JSON.stringify({role:'guest'}))
        .json(_error.auth);
});

require('./master/home')(app,config);
require('./master/auth')(app,config);
require('./master/settings')(app,config);
require('./master/resources')(app,config);
require('./master/resources/dbservers')(app,config);
require('./master/resources/repositories')(app,config);
require('./master/resources/planners')(app,config);
require('./master/resources/notifiers')(app,config);
require('./master/notifier')(app,config,notifier);
require('./master/projects')(app,config);
require('./master/workspace')(app,config);

app.use(function(error,request,response,next){
    if(error.code!=='EBADCSRFTOKEN'){
        return next(error);
    }
    response.status(403).send('forbidden');
});
app.use(function(request,response){
    if(config.env=='production'){
        response.status(404).sendFile(join(__dirname,'..','client','404.html'));
    }else{
        response.status(404).render('404');
    }
});

server.listen(app.get('port'),app.get('host'),function(){
    console.log('pleni ✯ master: listening on '
        +app.get('host')+':'+app.get('port')+'\n');
});

module.exports=app;

