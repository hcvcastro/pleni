'use strict';

require('es6-shim');

var planner=require('./planners/planner')
  , scheduler=require('./planners/scheduler')
  , server=require('./planners/server')
  , express=require('express')
  , io=require('socket.io')(server.http)
  , join=require('path').join
  , config=require('../config/planner')
  , notifier=function(msg){
        io.emit('notifier',msg);
    }

planner.prototype=new scheduler(notifier);

server.set(config.planner.host,config.planner.port,'io');
server.listen(new planner(config.planner.port,notifier));

io.on('connection',function(socket){
    socket.emit('notifier',{
        action:'connection'
    });
});

server.run();

module.exports=planner;
module.exports.app=server.app;

