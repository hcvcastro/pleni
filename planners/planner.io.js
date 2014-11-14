'use strict';

var planner=require('./abstracts/planner')
  , scheduler=require('./abstracts/scheduler')
  , express=require('express')
  , server=require('./abstracts/server')
  , io=require('socket.io')(server.http)
  , notifier=function(action,name,params){
        io.emit('notifier',{action:action,name:name,params:params});
    }
  , join=require('path').join

planner.prototype=new scheduler(notifier);

server.app.use(express.static(join(__dirname,'public')));
server.app.use(express.static(join(__dirname,'..','bower_components')));
server.app.get('/io.html',function(request,response){
    response.sendFile(join(__dirname,'public','io.html'));
});

server.set(process.env.PORT||3001);
server.listen(new planner(notifier));

io.on('connection',function(socket){
    socket.emit('notifier',{action:'connection'});
});

server.run();

module.exports.app=server.app;

