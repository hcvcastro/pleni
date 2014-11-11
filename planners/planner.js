'use strict';

var planner=require('./abstracts/planner')
  , scheduler=require('./abstracts/scheduler')
  , server=planner.server
  , notifier=new (function(){
        this.create=function(name,count,interval,tid){
            console.log('PUT TASK:'+name+'('+count+')('+interval
                        +') --> '+tid);
        }
        this.remove=function(name){
            console.log('DEL TASK:'+name);
        }
        this.run=function(name,params){
            console.log('RUN TASK:'+name);
        }
        this.stop=function(name){
            console.log('STOP TASK'+name);
        }
    })();

planner.prototype=new scheduler(notifier);

server.set(process.env.PORT||3001);
server.listen(new planner(notifier));
server.run();

module.exports=planner;
module.exports.app=server.app;

