'use strict';

var http=require('http')
  , express=require('express')
  , favicon=require('serve-favicon')
  , bodyparser=require('body-parser')
  , lessmiddleware=require('less-middleware')
  , join=require('path').join
  , url=require('url')
  , app=express()
  , server=http.createServer(app)
  , morgan=require('morgan')
  , redis=require('redis')
  , cookieparser=require('cookie-parser')
  , cookiesession=require('express-session')
  , redisstore=require('connect-redis')(cookiesession)
  , redisclient=redis.createClient()
  , ios=require('socket.io')(server)
  , ioc=require('socket.io-client')
  , sessionsocketio=require('session.socket.io')
  , validate=require('../core/validators')
  , _success=require('../core/json-response').success
  , _error=require('../core/json-response').error
  , monitor=require('./sites/monitor')
  , create=require('./sites/planners').create
  , fetch=require('./sites/planners').fetch
  , sitemap=require('./sites/planners').sitemap
  , free=require('./sites/planners').free
  , summarize=require('./sites/planners').summarize
  , report=require('./sites/planners').report
  , config=require('../config/sites')

app.set('port',config.sites.port);
app.disable('x-powered-by');
app.use(bodyparser.json());

if(config.env=='production'){
    app.use(favicon(join(__dirname,'..','client','favicon.ico')));
    app.use(express.static(join(__dirname,'..','client')));
    app.use(morgan('combined'));
}else{
    app.use(favicon(join(__dirname,'..','client','favicon.ico')));
    app.set('views',join(__dirname,'..','client','views','sites'));
    app.set('view engine','jade');

    app.use(lessmiddleware('/less',{
        dest:'/css'
      , pathRoot:join(__dirname,'..','client')
      , compress:false
    }));

    app.use(express.static(join(__dirname,'..','client')));
    app.use(express.static(join(__dirname,'..','bower_components')));
    app.locals.pretty=true;

    app.use(morgan('dev'));
}

var parser=cookieparser(config.cookie.secret);
app.use(parser);

var store=new redisstore({
    client:redisclient
  , host:config.redis.host
  , port:config.redis.port
  , prefix:config.redis.prefix
});
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

var get_session=function(id,done,fail){
        redisclient.get(id,function(err,reply){
            if(reply){
                done(JSON.parse(reply));
            }else if(fail){
                fail();
            }
        });
    }
  , save_session=function(id,session,done){
        redisclient.set(id,JSON.stringify(session),function(){
            if(done){
                done();
            }
        });
    }

var sockets={}
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
        console.log('SOCKET.IO new connection',sid);
    }

    sockets[sid][socket.id]=socket;
    console.log('SOCKET.IO new client',socket.id);

    socket.on('disconnect',function(){
        delete sockets[sid][socket.id];
        console.log('SOCKET.IO remove client',socket.id);

        if(Object.keys(sockets[sid]).length==0){
            delete sockets[sid];
            console.log('SOCKET.IO remove connection',sid);
        }
    });
});

var connect_planner=function(id,sessionID,planner,type){
        var socket=ioc.connect(planner,{
            reconnect:true
          , 'forceNew':true
        });
        socket.on('notifier',function(msg){
            socket_listener(socket,id,sessionID,planner,type,msg);
        });
    }
  , free_planner=function(planner,id,type){
        free(planner,function(args){
            monitor.freeplanner(config.sites.host+':'+config.sites.port
                +'/'+type+'/'+id);
        },function(error){
            console.log('ERROR','cannot free the planner');
        });
    }
  , socket_listener=function(socket,id,sessionID,planner,type,msg){
        if(msg.action=='connection'){
            notifier(id,{
                action:'connection'
              , msg:'Planner process connected'
            });
        }else if(msg.action=='create'&&msg.task&&msg.task.id
                &&msg.task.id=='site/create'){
            get_session(sessionID,function(session){
                session.state='prepare';
                session.action=msg.task.id;
                save_session(sessionID,session);
            });
            notifier(id,{
                action:'preparing'
              , msg:'Creating repository'
            });
        }else if(msg.action=='task'&&msg.task&&msg.task.id
                &&msg.task.id=='site/create'){
            get_session(sessionID,function(session){
                session.state='fetch';
                save_session(sessionID,session);

                fetch(planner,session.db,session.agent);
                notifier(id,{
                    action:'created'
                  , msg:'Repository created successfully'
                });
            });
        }else if(msg.action=='create'&&msg.task&&msg.task.id
                &&msg.task.id=='site/fetch'){
            get_session(sessionID,function(session){
                session.action=msg.task.id;
                save_session(sessionID,session);
            });
            notifier(id,{
                action:'starting'
              , msg:'Starting fetching website'
            });
        }else if(msg.action=='task'&&msg.task&&msg.task.id
                &&msg.task.id=='site/fetch'){
            notifier(id,msg);
        }else if(msg.action=='stop'){
            get_session(sessionID,function(session){
                if(session.action=='site/fetch'){
                    socket.disconnect();
                    free_planner(planner,id,type);

                    session.state='ready';
                    session.semaphore=0;
                    session.action='';
                    save_session(sessionID,session);

                    notifier(id,{
                        action:'stop'
                      , msg:'Requested pages in site completed'
                    });
                }
            });
        }else if(msg.action=='create'&&msg.task&&msg.task.id
                &&msg.task.id=='site/summarize'){
            get_session(sessionID,function(session){
                session.action=msg.task.id;
                save_session(sessionID,session);
            });
            notifier(id,{
                action:'preparing'
              , msg:'Summarizing the repository information'
            });
        }else if(msg.action=='task'&&msg.task&&msg.task.id
                &&msg.task.id=='site/summarize'){
            get_session(sessionID,function(session){
                report(planner,session.db);
                notifier(id,{
                    action:'created'
                  , msg:'Website summary created'
                });
            });
        }
    }
  , init_session_vars=function(request,response,template){
        if(!request.session.state){
            request.session.state='search';
            request.session.semaphore=0;
            request.session.save();
        }

        if(request.session.url){
            response.cookie('pleni.site.url',request.session.url);
        }else{
            response.cookie('pleni.site.url','');
        }

        if(config.env=='production'){
            response.status(200)
                .sendFile(join(__dirname,'..','client',template+'.html'));
        }else{
            if(template=='index'){
                response.status(200).render('dev');
            }else{
                response.status(200).render('pages/'+template);
            }
        }
    }

app.get('/',function(request,response){
    init_session_vars(request,response,'index');
});

app.get('/pages/:page',function(request,response){
    var pages=['search','sitemap','about','report']
      , page=request.params.page

    if(!pages.some(function(element){return element==page;})){
        response.status(404).json(_error.notfound);
    }

    init_session_vars(request,response,page);
});

app.put('/sites',function(request,response){
    if(validate.validHost(request.body.site)){
        var site=validate.toValidUrl(request.body.site)
          , agent=validate.toString(request.body.agent)
          , url=config.sites.host+':'+config.sites.port+'/i/'+request.sessionID

        if(request.session.semaphore===0){
            request.session.state='init';
            request.session.semaphore=1;
            request.session.action='';
            request.session.url=site;
            request.session.agent=agent;
            request.session.db=monitor.getrepository();
            request.session.save();

            monitor.getplanner(url,function(msg){
                response.cookie('pleni.site.url',site);
                response.status(200).json(msg);
            });
        }else{
            response.status(403).json(_error.busy);
        }
    }else{
        response.status(403).json(_error.validation);
    }
});

app.post('/i/:id',function(request,response){
    var id=request.params.id
      , sessionID='sites:'+request.params.id
      , planner=request.body.planner

    get_session(sessionID,function(session){
        connect_planner(id,sessionID,planner,'i');
        create(planner,session.db,session.url);
        response.status(200).json(_success.ok);
    },function(){
        free_planner(planner,id,'i');
        response.status(403).json(_error.notfound);
    });
});

app.post('/sitemap',function(request,response){
    switch(request.session.state){
        case 'search':
        case 'init':
        case 'prepare':
            response.status(200).json(_success.ok);
            break
        case 'fetch':
        case 'ready':
            sitemap(request.session.db,function(args){
                if(args&&args.site&&args.site.sitemap){
                    response.status(200).json(args.site.sitemap);
                }else{
                    response.status(404).json(_error.notfound);
                }
            },function(error){
                response.status(404).json(_error.json);
            });
            break;
    }
});

app.delete('/',function(request,response){
    if(sockets[request.sessionID]){
        for(var i in sockets[request.sessionID]){
            sockets[request.sessionID][i].disconnect();
        }
        request.session.destroy();
    }
    response.status(200).json(_success.ok);
});

app.put('/more',function(request,response){
    var url=config.sites.host+':'+config.sites.port+'/j/'+request.sessionID

    if(request.session.semaphore===0){
        request.session.semaphore=1;
        request.session.save();

        monitor.getplanner(url,function(msg){
            response.status(200).json(msg);
        });
    }else{
        response.status(403).json(_error.busy);
    }
});

app.post('/j/:id',function(request,response){
    var id=request.params.id
      , sessionID='sites:'+request.params.id
      , planner=request.body.planner

    get_session(sessionID,function(session){
        connect_planner(id,sessionID,planner,'j');
        fetch(planner,session.db,session.agent);
        response.status(200).json(_success.ok);
    },function(){
        free_planner(planner,id,'j');
        response.status(403).json(_error.notfound);
    });
});

app.put('/report',function(request,response){
    var url=config.sites.host+':'+config.sites.port+'/k/'+request.sessionID

    if(request.session.semaphore===0){
        request.session.semaphore=1;
        request.session.save();

        monitor.getplanner(url,function(msg){
            response.status(200).json(msg);
        });
    }else{
        response.status(403).json(_error.busy);
    }
});

app.post('/k/:id',function(request,response){
    var id=request.params.id
      , sessionID='sites:'+request.params.id
      , planner=request.body.planner

    get_session(sessionID,function(session){
        connect_planner(id,sessionID,planner,'k');
        summarize(planner,session.db);
        response.status(200).json(_success.ok);
    },function(){
        free_planner(planner,id,'k');
        response.status(403).json(_error.notfound);
    });
});

server.listen(app.get('port'),'localhost',function(){
    console.log('pleni ✯ quickstart sites: listening on port '
        +app.get('port')+'\n');
});

module.exports=app;

