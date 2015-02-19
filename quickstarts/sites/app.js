'use strict';

var http=require('http')
  , express=require('express')
  , favicon=require('serve-favicon')
  , bodyparser=require('body-parser')
  , lessmiddleware=require('less-middleware')
  , join=require('path').join
  , url=require('url')
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
app.use(morgan('dev'));

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
  , saveUninitialized:false
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
    console.log(sockets);
    if(request.session.url){
        response.cookie('pleni.url',request.session.url);
    }else{
        response.cookie('pleni.url','');
    }
    response.render('index');
});

app.get('/sites',function(request,response){
    response.render('pages/sites');
});

app.get('/map',function(request,response){
    response.render('pages/map');
});

app.put('/sites',function(request,response){
    if(validate.validHost(request.body.site)){
        var site=validate.toValidHost(request.body.site)
          , agent=validate.toString(request.body.agent)
          , url='http://localhost:'+app.get('port')+'/p/'+request.sessionID

        monitor.getplanner(url);

        request.session.url=site;
        request.session.agent=agent;
        request.session.action='';
        request.session.db=monitor.getrepository();

        response.cookie('pleni.url',site);
        response.status(200).json(_success.ok);
    }else{
        response.status(403).json(_error.json);
    }
});

app.post('/mapsite',function(request,response){
    if(request.session.mapsite){
        planners.mapsite(request.session.db,function(args){
            if(args&&args.site&&args.site.mapsite){
                response.status(200).json(args.site.mapsite);
            }else{
                response.status(404).json(_error.notfound);
            }
        },function(error){
            response.status(404).json(_error.json);
        });
    }else{
        response.status(200).json(_success.ok);
    }
});

app.post('/p/:id',function(request,response){
    var session=request.params.id
      , sessionID='sites:'+request.params.id
      , planner=request.body.planner
      , dw_planner=url.parse(planner)

    redisclient.get(sessionID,function(err,reply){
        var _session=JSON.parse(reply);
          , socket=ioc.connect(planner,{
                reconnect:true
              , 'forceNew':true
            })

        socket.on('notifier',function(msg){
            switch(msg.action){
                case 'create':
                    redisclient.get(sessionID,function(err,reply){
                        var s=JSON.parse(reply);
                        s.action=msg.task.name;
                        redisclient.set(sessionID,JSON.stringify(s));
                    });
                    break;
                case 'run':
                    break;
                case 'task':
                    if(msg.task.id=='site/create'){
                        redisclient.get(sessionID,function(err,reply){
                            var s=JSON.parse(reply);
                            s.mapsite=true;
                            redisclient.set(sessionID,JSON.stringify(s));
                        });

                        planners.fetch(planner,db,agent,function(args){
                        },function(error){
                            for(var i in sockets[session]){
                                sockets[session][i].emit('notifier',{
                                    action:'error'
                                  , msg:error
                                });
                            }
                        });

                        for(var i in sockets[session]){
                            sockets[session][i].emit('notifier',{
                                action:'create'
                              , msg:'Created site repository ...'
                            });
                        }
                    }else if(msg.task.id=='site/fetch'){
                        for(var i in sockets[session]){
                            sockets[session][i].emit('notifier',msg);
                        }
                    }
                    break;
                case 'stop':
                    redisclient.get(sessionID,function(err,reply){
                        var s=JSON.parse(reply);
                        if(s.action=='site/fetch'){
                            socket.disconnect();

                            for(var i in sockets[session]){
                                sockets[session][i].emit('notifier',{
                                    action:'stop'
                                  , msg:'20 pages in site completed'
                                });
                            }
                            planners.free(planner,function(args){
                            },function(error){
                                for(var i in sockets[session]){
                                    sockets[session][i].emit('notifier',{
                                        action:'error'
                                      , msg:error
                                    });
                                }
                            });
                        }
                    });
                    break;
            }
        });

        planners.create(planner,db,site,function(args){
        },function(error){
            for(var i in sockets[session]){
                sockets[session][i].emit('notifier',{
                    action:'error'
                  , msg:error
                });
            }
        });

    });

    response.status(200).json(_success.ok);
});

var sockets={}
  , sessionsockets=new sessionsocketio(ios,store,parser,'pleni.sid');

sessionsockets.on('connection',function(err,socket,session){
    console.log('socket connection ... '+socket.id);
    var sid=socket.handshake.signedCookies['pleni.sid'];
    if(!(sid in sockets)){
        sockets[sid]={};
    }
    sockets[sid][socket.id]=socket;

    socket.on('disconnect',function(){
        console.log('socket disconnection ... '+socket.id);
        delete sockets[sid][socket.id];
        if(Object.keys(sockets[sid]).length==0){
            delete sockets[sid];
        }
    });
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

