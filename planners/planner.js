'use strict';

var planner=require('./abstracts/planner')
  , scheduler=require('./abstracts/scheduler')
  , server=require('./abstracts/server')
  , notifier=function(msg){
        console.log(JSON.stringify(msg));
    }

planner.prototype=new scheduler(notifier);

server.set(process.env.PORT||3001,'none');
server.listen(new planner(notifier));
server.run();

module.exports=planner;
module.exports.app=server.app;

