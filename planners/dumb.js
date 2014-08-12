'use strict';

var server=require('./abstracts/server')
  , scheduler=require('./abstracts/scheduler')
  , planner=new scheduler()

planner.count=Number.POSITIVE_INFINITY;
planner.task=function(repeat,stop){
    console.log('duh!');
    repeat();
}

server.set(3000);
server.listen(planner);
server.run();

exports.app=server.app;

