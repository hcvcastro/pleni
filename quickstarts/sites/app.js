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
  , create=require('./common/planners').create
  , fetch=require('./common/planners').fetch
  , mapsite=require('./common/planners').mapsite
  , free=require('./common/planners').free
  , secret='pleni'
  , env=process.env.ENV||'production'

app.set('port',process.env.PORT||3003);
app.disable('x-powered-by');
app.use(favicon(
    join(__dirname,'..','..','master','public','img','favicon.ico')));
app.use(bodyparser.json());


if(env=='production'){
    app.use(express.static(join(__dirname,'dist')));
    app.use(morgan('combined'));
}else{
    app.set('views',join(__dirname,'views'));
    app.set('view engine','jade');

    app.use(lessmiddleware('/less',{
        dest:'/css'
      , pathRoot:join(__dirname,'..','..','master','public')
      , compress:true
    }));

    app.use(express.static(join(__dirname,'public')));
    app.use(express.static(join(__dirname,'..','..','master','public')));
    app.use(express.static(join(__dirname,'..','..','bower_components')));
    app.locals.pretty=false;

    app.use(morgan('dev'));
}

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

app.get('/',function(request,response){
    if(request.session.url){
        response.cookie('pleni.url',request.session.url);
    }else{
        response.cookie('pleni.url','');
    }
    if(env=='production'){
        response.sendFile(join(__dirname,'dist','index.html'));
    }else{
        response.render('dev');
    }
});

app.get('/sites',function(request,response){
    if(env=='production'){
        response.sendFile(join(__dirname,'dist','sites.html'));
    }else{
        response.render('pages/sites');
    }
});

app.get('/map',function(request,response){
    if(env=='production'){
        response.sendFile(join(__dirname,'dist','map.html'));
    }else{
        response.render('pages/map');
    }
});

app.put('/sites',function(request,response){
    if(validate.validHost(request.body.site)){
        var site=validate.toValidHost(request.body.site)
          , agent=validate.toString(request.body.agent)
          , url='http://localhost:'+app.get('port')+'/p/'+request.sessionID

        request.session.url=site;
        request.session.agent=agent;
        request.session.action='';
        request.session.db=monitor.getrepository();
        request.session.save();

        monitor.getplanner(url);

        response.cookie('pleni.url',site);
        response.status(200).json(_success.ok);
    }else{
        response.status(403).json(_error.json);
    }
});

app.post('/mapsite',function(request,response){
    if(request.session.mapsite){
        mapsite(request.session.db,function(args){
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

var get_session=function(id,done){
        redisclient.get(id,function(err,reply){
            done(JSON.parse(reply));
        });
    }
  , save_session=function(id,session,done){
        redisclient.set(id,JSON.stringify(session),function(){
            if(done){
                done();
            }
        });
    }
  , notifier=function(id,msg){
        for(var i in sockets[id]){
            sockets[id][i].emit('notifier',msg);
        }
    }

app.post('/p/:id',function(request,response){
    var id=request.params.id
      , sessionID='sites:'+request.params.id
      , planner=request.body.planner

    get_session(sessionID,function(session){
        var socket=ioc.connect(planner,{
            reconnect:true
          , 'forceNew':true
        });
        socket.on('notifier',function(msg){
            console.log(msg);
            switch(msg.action){
                case 'create':
                    get_session(sessionID,function(session){
                        session.action=msg.task.name;
                        save_session(sessionID,session);
                    });
                    break;
                case 'run':
                    break;
                case 'task':
                    if(msg.task.id=='site/create'){
                        get_session(sessionID,function(session){
                            session.mapsite=true;
                            save_session(sessionID,session,function(){
                                fetch(planner,session.db,session.agent,
                                function(args){
                                },function(error){
                                    notifier(id,{
                                        action:'error'
                                      , msg:error
                                    });
                                });

                                notifier(id,{
                                    action:'create'
                                  , msg:'Created site repository ...'
                                });
                            });
                        });
                    }else if(msg.task.id=='site/fetch'){
                        notifier(id,msg);
                    }
                    break;
                case 'stop':
                    get_session(sessionID,function(session){
                        if(session.action=='site/fetch'){
                            socket.disconnect();
                            notifier(id,{
                                action:'stop'
                              , msg:'20 pages in site completed'
                            });

                            free(planner,function(args){
                                monitor.freeplanner('http://localhost:'+
                                    app.get('port')+'/p/'+id);
                            },function(error){
                                notifier(id,{
                                    action:'error'
                                  , msg:error
                                });
                            });
                        }
                    });
                    break;
            }
        });

        create(planner,session.db,session.url,function(args){
        },function(error){
            notifier(id,{
                action:'error'
              , msg:error
            });
        });
    });

    response.status(200).json(_success.ok);
});

var sockets={}
  , sessionsockets=new sessionsocketio(ios,store,parser,'pleni.sid');

sessionsockets.on('connection',function(err,socket,session){
    var sid=socket.handshake.signedCookies['pleni.sid'];
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

server.listen(app.get('port'),'localhost',function(){
    console.log('pleni ✯ quickstart sites: listening on port '
        +app.get('port')+'\n');
});

module.exports=app;

