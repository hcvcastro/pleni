'use strict';

require('es6-shim');

var planner=require('./planners/planner')
  , scheduler=require('./planners/scheduler')
  , server=require('./planners/server')
  , express=require('express')
  , favicon=require('serve-favicon')
  , lessmiddleware=require('less-middleware')
  , io=require('socket.io')(server.http)
  , join=require('path').join
  , config=require('../config/planner')
  , notifier=function(msg){
        io.emit('notifier',msg);
    }

planner.prototype=new scheduler(notifier);

if(config.env=='production'){
    server.app.use(favicon(join(__dirname,'..','client','favicon.ico')));
    server.app.use(express.static(join(__dirname,'..','client')));
}else{
    server.app.use(favicon(join(__dirname,'..','client','favicon.ico')));
    server.app.set('views',join(__dirname,'..','client','views','planner'));
    server.app.set('view engine','jade');

    server.app.use(lessmiddleware('/less',{
        dest:'/css'
      , pathRoot:join(__dirname,'..','client')
      , compress:false
    }));

    server.app.use(express.static(join(__dirname,'..','client')));
    server.app.use(express.static(join(__dirname,'..','bower_components')));
    server.app.locals.pretty=true;
}

server.app.get('/',function(request,response){
    if(config.env=='production'){
        response.status(200)
            .sendFile(join(__dirname,'..','client','index.html'));
    }else{
        response.status(200).render('dev');
    }
});

server.set(config.planner.host,config.planner.port,'ion');
server.listen(new planner(config.planner.port,notifier));

io.on('connection',function(socket){
    socket.emit('notifier',{
        planner:{
            action:'connection'
        }
    });
});

server.run();

module.exports=planner;
module.exports.app=server.app;

