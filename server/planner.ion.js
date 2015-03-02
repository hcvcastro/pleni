'use strict';

var planner=require('./planners/planner')
  , scheduler=require('./planners/scheduler')
  , server=require('./planners/server')
  , express=require('express')
  , io=require('socket.io')(server.http)
  , join=require('path').join
  , port=process.env.PORT||3001
  , notifier=function(msg){
        io.emit('notifier',msg);
    }

planner.prototype=new scheduler(notifier);

server.app.use(express.static(join(__dirname,'public')));
server.app.use(express.static(join(__dirname,'..','bower_components')));
server.app.get('/msg.html',function(request,response){
    response.sendFile(join(__dirname,'public','msg.html'));
});

server.set(port,'ion');
server.listen(new planner(port,notifier));

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

