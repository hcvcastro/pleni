'use strict';

var http=require('http')
  , request=require('request')
  , join=require('path').join
  , validate=require('../core/validators')
  , _success=require('../core/json-response').success
  , _error=require('../core/json-response').error
  , express=require('express')
  , morgan=require('morgan')
  , lessmiddleware=require('less-middleware')
  , favicon=require('serve-favicon')
  , bodyparser=require('body-parser')
  , cookieparser=require('cookie-parser')
  , cookiesession=require('express-session')
  , redis=require('redis')
  , redisstore=require('connect-redis')(cookiesession)
  , passport=require('passport')
  , localstrategy=require('passport-local').Strategy
  , mongoose=require('mongoose')
  , app=express()
  , server=http.createServer(app)
  , config=require('../config/monitor')

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

mongoose.connect(config.mongo.url);
var mongodb=mongoose.connection;
mongodb.on('error',console.error.bind(console,'mongo connection error:'));
mongodb.once('open',function(){
    console.log('connection to mongo db:',config.mongo.url);
});

passport.serializeUser(function(user,done){
    done(null,user.id);
});
passport.deserializeUser(function(id,done){
    if(id===0){
        done(null,{
            id:0
          , email:config.monitor.email
        });
    }
});
passport.use(new localstrategy({
    usernameField:'email'
  , passwordField:'password'
  , passReqToCallback:true
},function(request,email,password,done){
    if(email===config.monitor.email){
        if(password===config.monitor.password){
            return done(null,{
                id:0
              , email:config.monitor.email
            });
        }
    }
    return done(null,false,{
        message:'Invalid credentials'
    });
}));

app.set('host',config.monitor.host);
app.set('port',config.monitor.port);
app.disable('x-powered-by');

app.use(favicon(join(__dirname,'..','client','favicon.ico')));
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

if(config.env=='production'){
    app.set('views',join(__dirname,'..','views'));
    app.set('view engine','jade');

    app.use(express.static(join(__dirname,'..','client')));
    app.locals.pretty=false;

    app.use(morgan('combined'));
}else{
    app.set('views',join(__dirname,'..','client','views','monitor'));
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
        .cookie('pleni.monitr.auth',JSON.stringify({role:'guest'}))
        .json(_error.auth);
});

require('./monitor/home')(app,config);
require('./monitor/clients')(app,config);
require('./monitor/planners')(app,config);
require('./monitor/dbservers')(app,config);
require('./monitor/auth')(app,config);

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
    console.log('pleni ✯ monitor: listening on '
        +app.get('host')+':'+app.get('port')+'\n');
});

module.exports=app;

