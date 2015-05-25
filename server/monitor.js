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

/*  , assign=function(planner,done){
        redisclient.zrange('monitor:queue',0,0,function(err,task){
            if(task.length!=0){
                redisclient.zremrangebyrank('monitor:queue',0,0,function(){
                    notify(task[0],planner,function(){
                        redisclient.hset('monitor:tasks',task[0],planner,
                        function(){
                            done();
                        });
                    },function(){
                        var penalty=Math.floor(Math.random()*8);
                        redisclient.zadd('monitor:queue',Date.now()+penalty,
                        task[0],function(){
                            assign(planner,done);
                        });
                    });
                });
            }else{
                redisclient.sadd('monitor:free',planner,function(){
                    done();
                });
            }
        });
    }
  , notify=function(task,planner,success,fail){
        console.log('ASSIGN ',task,' -> ',planner);
        if(config.env=='test'){
            success();
        }else{
            request.post({
                url:task
              , json:{planner:planner}
            },function(error,response){
                if(!error){
                    if(response.statusCode==200){
                        console.log('SUCCESS');
                        success();
                    }else{
                        console.log('FAIL',response.statusCode);
                        fail();
                    }
                }else{
                    console.log(error);
                    fail();
                }
            });
        }
    }*/

/*
redisclient.del('monitor:planners');
redisclient.del('monitor:free');
redisclient.del('monitor:queue');
redisclient.del('monitor:tasks');

app.get('/id',function(request,response){
    response.status(200).json({
        monitor:'ready for action'
    });
});

app.put('/planners',function(request,response){
    if(validate.validHost(request.body.planner)){
        var planner=validate.toValidHost(request.body.planner)

        redisclient.sismember('monitor:planners',planner,function(err,res){
            if(!res){
                redisclient.sadd('monitor:planners',planner,function(err,reply){
                    assign(planner,function(){
                        response.status(200).json(_success.ok);
                    });
                });
            }else{
                response.status(403).json(_error.notoverride);
            }
        });
    }else{
        response.status(403).json(_error.json);
    }
});

app.put('/tasks',function(request,response){
    if(validate.validHost(request.body.task)){
        var task=request.body.task;

        redisclient.spop('monitor:free',function(err,planner){
            redisclient.zadd('monitor:queue',Date.now(),task,
            function(err,reply){
                if(planner){
                    assign(planner,function(){
                        response.status(200).json({
                            msg:'Available planner found'
                          , queue:0
                        });
                    });
                }else{
                    redisclient.zcard('monitor:queue',function(err,reply){
                        response.status(200).json({
                            msg:'Waiting for an available planner'
                          , queue:reply
                        });
                    });
                }
            });
        });
    }else{
        response.status(403).json(_error.json);
    }
});

app.delete('/tasks',function(request,response){
    if(validate.validHost(request.body.task)){
        var task=request.body.task;
        redisclient.hget('monitor:tasks',task,function(err,planner){
            if(planner){
                redisclient.hdel('monitor:tasks',task,function(){
                    assign(planner,function(){
                        response.status(200).json(_success.ok);
                    });
                });
            }else{
                redisclient.zrem('monitor:queue',task,function(err,task){
                    response.status(200).json(_success.ok);
                });
            }
        })
    }else{
        response.status(403).json(_error.json);
    }
});

app.delete('/planners',function(request,response){
    if(validate.validHost(request.body.planner)){
        var planner=validate.toValidHost(request.body.planner)

        redisclient.sismember('monitor:free',planner,function(err,res){
            if(res){
                redisclient.srem('monitor:free',planner,function(){
                    redisclient.srem('monitor:planners',planner,function(){
                        response.status(200).json(_success.ok);
                    });
                });
            }else{
                response.status(403).json(_error.busy);
            }
        });
    }else{
        response.status(403).json(_error.json);
    }
});
*/

