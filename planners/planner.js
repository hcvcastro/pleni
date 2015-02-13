'use strict';

var planner=require('./abstracts/planner')
  , scheduler=require('./abstracts/scheduler')
  , server=require('./abstracts/server')
  , port=process.env.PORT||3001
  , notifier=function(msg){
        console.log(JSON.stringify(msg));
    }

planner.prototype=new scheduler(notifier);

server.set(port,'none');
server.listen(new planner(port,notifier));
server.run();

module.exports=planner;
module.exports.app=server.app;

