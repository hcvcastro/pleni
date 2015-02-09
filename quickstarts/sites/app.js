'use strict';

var http=require('http')
  , express=require('express')
  , favicon=require('serve-favicon')
  , bodyparser=require('body-parser')
  , lessmiddleware=require('less-middleware')
  , join=require('path').join
  , app=express()
  , server=http.Server(app)
  , morgan=require('morgan')
  , redis=require('redis')
  , cookieparser=require('cookie-parser')
  , session=require('express-session')
  , redisstore=require('connect-redis')(session)
  , redisclient=redis.createClient()
  , ios=require('socket.io')(server)
  , ioc=require('socket.io-client')
  , validate=require('../../planners/utils/validators')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , generator=require('../../planners/functions/utils/random').sync
  , planners=require('./planners')
  , planner={}
  , db={}
  , socket=undefined
  , site=''
  , agent=''

app.set('port',process.env.PORT||3003);
app.set('views',join(__dirname,'views'));
app.set('view engine','jade');
app.disable('x-powered-by');
app.use(favicon(
    join(__dirname,'..','..','master','public','img','favicon.ico')));
app.use(bodyparser.json());
app.use(morgan('dev'))
app.use(cookieparser('pleni'));
app.use(session({
    secret:'pleni'
  , store:new redisstore({host:'localhost',port:6379,client:redisclient})
  , saveUninitialized:true
  , resave:false
}));

app.use(lessmiddleware('/less',{
    dest:'/css'
  , pathRoot:join(__dirname,'..','..','master','public')
  , compress:true
}));

app.use(express.static(join(__dirname,'public')));
app.use(express.static(join(__dirname,'..','..','master','public')));
app.use(express.static(join(__dirname,'..','..','bower_components')));
app.locals.pretty=false;

app.get('/',function(request,response){
    planner={
        host:'http://localhost'
      , port:3001
    }
  , db={
        host:'http://localhost:5984'
      , user:'jacobian'
      , pass:'asdf'
      , name:'pleni_site_qs_'+generator()
    }
  , socket=ioc.connect(planner.host+':'+planner.port,{reconnect:true})
    socket.on('notifier',function(msg){
        if(msg.action=='task'){
            if(msg.task.id=='site/create'){
                planners.fetch(planner,db,agent,function(args){
                },function(error){
                    ios.emit('notifier',{
                        action:'error'
                      , msg:error
                    });
                });
                ios.emit('notifier',{
                    action:'ready'
                  , msg:{}
                });
            }

            if(msg.task.id=='site/fetch'){
                ios.emit('notifier',msg);
            }
        }
    });

    response.render('index');
});
app.get('/sites',function(request,response){
    response.render('pages/sites');
});
app.put('/sites',function(request,response){
    site=validate.toString(request.body.site);
    agent=validate.toString(request.body.agent);

    if(validate.validHost(site)){
        planners.create(planner,db,site,function(args){
        },function(error){
            ios.emit('notifier',{
                action:'error'
              , msg:error
            });
        });
        response.status(200).json(_success.ok);
    }else{
        response.status(403).json(_error.json);
    }
});

app.use(function(request,response){
    response.status(404).render('404.jade',{
        title:'404',
        message:'I\'m so sorry, but file not found!!'
    });
});

server.listen(app.get('port'),function(){
    console.log('pleni ✯ quickstart sites: listening on port '
        +app.get('port')+'\n');
});

module.exports=app;

