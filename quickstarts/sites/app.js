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
  , cookiesession=require('express-session')
  , redisstore=require('connect-redis')(cookiesession)
  , redisclient=redis.createClient()
  , ios=require('socket.io')(server)
  , ioc=require('socket.io-client')
  , sessionsocketio=require('session.socket.io')
  , validate=require('../../planners/utils/validators')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , monitor=require('./common/monitor')
  , planners=require('./common/planners')
  , secret='pleni'

app.set('port',process.env.PORT||3003);
app.set('views',join(__dirname,'views'));
app.set('view engine','jade');
app.disable('x-powered-by');
app.use(favicon(
    join(__dirname,'..','..','master','public','img','favicon.ico')));
app.use(bodyparser.json());
app.use(morgan('dev'))

var parser=cookieparser(secret);
app.use(parser);

var store=new redisstore({
    client:redisclient
  , host:'localhost'
  , port:6379
  , prefix:'sites:'
});
app.use(cookiesession({
    cookie:{
        path:'/'
      , httpOnly:true
      , secure:false
      , maxAge:3600000
    }
  , name:'pleni.sid'
  , resave:false
  , saveUninitialized:true
  , secret:secret
  , store:store
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
    response.render('index');
});

app.get('/sites',function(request,response){
    response.render('pages/sites');
});

app.get('/map',function(request,response){
    response.render('pages/map');
});

app.put('/sites',function(request,response){
    var site=validate.toString(request.body.site)
      , agent=validate.toString(request.body.agent);

    if(validate.validHost(site)){
        ios.emit('notifier',{
            action:'start'
          , msg:'Starting the process ...'
        });
        fetchsite(monitor.getplanner(),monitor.getrepository(),site,agent);
        response.status(200).json(_success.ok);
    }else{
        response.status(403).json(_error.json);
    }
});

var action='';
var fetchsite=function(planner,db,site,agent){
    var socket=ioc.connect(planner.host+':'+planner.port,{
        reconnect:true,'forceNew':true});
    socket.on('notifier',function(msg){
        switch(msg.action){
            case 'create':
                action=msg.task.name;
                break;
            case 'run':
                break;
            case 'task':
                if(msg.task.id=='site/create'){
                    planners.fetch(planner,db,agent,function(args){

                    },function(error){
                        ios.emit('notifier',{
                            action:'error'
                          , msg:error
                        });
                    });
                    ios.emit('notifier',{
                        action:'create'
                      , msg:'Created site repository ...'
                    });
                }
                if(msg.task.id=='site/fetch'){
                    ios.emit('notifier',msg);
                }
                break;
            case 'stop':
                if(action=='site/fetch'){
                    socket.disconnect();
                }
                break;
        }
    });

    planners.create(planner,db,site,function(args){
    },function(error){
        ios.emit('notifier',{
            action:'error'
          , msg:error
        });
    });
};

var sessionsockets=new sessionsocketio(ios,store,parser,'pleni.sid');
sessionsockets.on('connection',function(err,socket,session){
});

app.use(function(request,response){
    response.status(404).render('404.jade',{
        title:'404',
        message:'I\'m so sorry, but file not found!!'
    });
});

server.listen(app.get('port'),'localhost',function(){
    console.log('pleni ✯ quickstart sites: listening on port '
        +app.get('port')+'\n');
});

module.exports=app;
