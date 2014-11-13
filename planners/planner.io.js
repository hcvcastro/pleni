'use strict';

var planner=require('./abstracts/planner')
  , scheduler=require('./abstracts/scheduler')
  , server=planner.server
  , http=planner.http
  , io=require('socket.io')(http)
  , express=require('express')
  , join=require('path').join
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

io.sockets.on('notifier',function(socket){
    console.log('client connected');
});

/* override */
server.app.use(express.static(join(__dirname,'public')));
server.app.use(express.static(join(__dirname,'..','bower_components')));
server.app.use(express.static(join(__dirname,'..','node_modules')));

server.app.get('/',function(request,response){
    response.sendFile(join(__dirname,'public','index.io.html'));
});

planner.prototype=new scheduler(notifier);

server.set(process.env.PORT||3001);
server.listen(new planner(notifier));
server.run();

module.exports=planner;
module.exports.app=server.app;

