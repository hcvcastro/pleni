'use strict';

var planner=require('./abstracts/planner')
  , scheduler=require('./abstracts/scheduler')
  , join=require('path').join
  , io=require('socket.io')(http)
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

planner.prototype=new scheduler(notifier);

var server=planner.server
  , http=planner.http

/* override */
//server.app.use(express.static(join(__dirname,'public')));
//server.app.use(express.static(join(__dirname,'..','bower_components')));
//server.app.use(express.static(join(__dirname,'..','node_modules')));

//server.app.get('/',function(request,response){
//    response.sendFile(join(__dirname,'public','index.io.html'));
//});


//server.set(process.env.PORT||3001);
//server.listen(new planner(notifier));

io.sockets.on('notifier',function(socket){
    console.log('client connected');
});

//server.run();

module.exports=planner;
module.exports.app=server.app;

