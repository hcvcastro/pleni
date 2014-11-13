'use strict';

var planner=require('./abstracts/planner')
  , scheduler=require('./abstracts/scheduler')
  , express=require('express')
  , server=require('./abstracts/server')
  , io=require('socket.io')(server.http)
  , notifier=new (function(){
        this.create=function(name,count,interval,tid){
            io.emit('created task',
                {name:name,count:count,interval:interval,tid:tid});
        }
        this.remove=function(name){
            io.emit('removed task',{name:name});
        }
        this.run=function(name,params){
            io.emit('running task',{name:name,params:params});
        }
        this.stop=function(name){
            io.emit('stopped task',{name:name});
        }
    })()
  , join=require('path').join

planner.prototype=new scheduler(notifier);

server.app.use(express.static(join(__dirname,'public')));
server.app.use(express.static(join(__dirname,'..','bower_components')));
server.app.get('/io.html',function(request,response){
    response.sendFile(join(__dirname,'public','io.html'));
});

server.set(process.env.PORT||3001);
server.listen(new planner(notifier));

io.sockets.on('notifier',function(socket){
    console.log('client connected');
});

server.run();

module.exports.app=server.app;

