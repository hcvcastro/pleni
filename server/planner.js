'use strict';

require('es6-shim');

var planner=require('./planners/planner')
  , scheduler=require('./planners/scheduler')
  , server=require('./planners/server')
  , config=require('../config/planner')
  , notifier=function(msg){
        console.log(JSON.stringify(msg));
    }

planner.prototype=new scheduler(notifier);

server.set(config.planner.host,config.planner.port,'none');
server.listen(new planner(config.planner.port,notifier));
server.run();

module.exports=planner;
module.exports.app=server.app;

