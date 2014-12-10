'use strict';

var planner=require('./abstracts/planner')
  , scheduler=require('./abstracts/scheduler')
  , server=require('./abstracts/server')
  , notifier=function(action,name,params){
        var string='['+action+']';
        if(name){
            string+=' '+name;
        }
        if(params){
            string+=' '+JSON.stringify(params);
        }
        console.log(string);
    }

planner.prototype=new scheduler(notifier);

server.set(process.env.PORT||3001,'none');
server.listen(new planner(notifier));
server.run();

module.exports=planner;
module.exports.app=server.app;

