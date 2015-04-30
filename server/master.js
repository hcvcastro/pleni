'use strict';

var http=require('http')
  , join=require('path').join
  , config=require('../config/master')
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
  , model_user=require('./master/models/user')
  , app=express()
  , server=http.Server(app)
  , ios=require('socket.io')(server)
  , ioc=require('socket.io-client')
  , loadconfig=require('../core/loadconfig')
  , store=new redisstore({
        client:redisclient
      , host:config.redis.host
      , port:config.redis.port
      , prefix:config.redis.prefix
    })

var redisclient=redis.createClient(
    config.redis.port,config.redis.host,config.redis.options)
redisclient.on('error',console.error.bind(console,'redis connection error:'));
redisclient.on('ready',function(){
    console.log('connection to redis db: '+config.redis.host+':'
        +config.redis.port);
})

mongoose.connect(config.mongo.url);
var mongodb=mongoose.connection;
mongodb.on('error',console.error.bind(console,'mongo connection error:'));
mongodb.once('open',function(){
    console.log('connection to mongo db: '+config.mongo.url);
});

passport.serializeUser(function(user,done){
    done(null,user.id);
});
passport.deserializeUser(function(id,done){
    if(config.master.admin&&id===0){
        done(null,{
            email:config.master.email
        });
    }else{
        model_user.findById(id,function(err,user){
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
        if(email===config.master.email&&password===config.master.password){
            return done(null,{
                id:0
              , email:config.master.email
            });
        }
    }

    model_user.findOne({
        email:email
    },function(err,user){
        if(err){
            return done(err);
        }
        if(!user){
            return done(null,false,{
                message:'Unknown email: '+email
            });
        }
        user.comparePassword(password,function(err,isMatch){
            if(err){
                return done(err);
            }
            if(isMatch){
                return done(null,user);
            }else{
                return done(null,false,{
                    message:'Invalid password'
                });
            }
        });
    });
}));

var resources={}
  , notifier=new Array()
  , projects=new Array()

// sync methods
resources.dbservers=loadconfig(join(__dirname,'..','config','dbservers.json'));
resources.repositories=loadconfig(join(__dirname,'..','config','repositories.json'));
resources.planners=loadconfig(join(__dirname,'..','config','planners.json'));
resources.notifiers=loadconfig(join(__dirname,'..','config','notifiers.json'));
projects=loadconfig(join(__dirname,'..','config','projects.json'));

app.set('resources',resources);
app.set('notifier',notifier);
app.set('projects',projects);

app.set('host',config.master.host);
app.set('port',config.master.port);
app.disable('x-powered-by');

app.use(cookieparser(config.cookie.secret));
app.use(bodyparser.json());
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

/*if(config.env=='production'){
    app.use(favicon(join(__dirname,'..','client','favicon.ico')));
    app.use(express.static(join(__dirname,'..','client')));
    app.use(morgan('combined'));
}else{*/
    app.use(favicon(join(__dirname,'..','client','favicon.ico')));
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
//}

require('./master/home')(app);
require('./master/auth')(app,passport);
require('./master/resources')(app);
require('./master/resources/dbservers')(app);
require('./master/resources/repositories')(app);
require('./master/resources/planners')(app);
require('./master/resources/notifiers')(app);
require('./master/notifier')(app,ios,ioc);
require('./master/projects')(app);
require('./master/workspace')(app);

app.use(function(error,request,response,next){
    if(error.code!=='EBADCSRFTOKEN'){
        return next(error);
    }
    response.status(403).send('forbidden');
});
app.use(function(request,response){
    response.status(404).render('404.jade',{
        title:'404',
        message:'I\'m so sorry, but file not found!!'
    });
});

ios.sockets.on('connection',function(socket){
    socket.emit('notifier',{
        action:'connection'
    });
});

server.listen(app.get('port'),app.get('host'),function(){
    console.log('pleni ✯ master: listening on '
        +app.get('host')+':'+app.get('port')+'\n');
});

module.exports=app;

