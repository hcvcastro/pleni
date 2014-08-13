'use strict';

var server=require('./abstracts/server')
  , scheduler=require('./abstracts/scheduler')

var planner=function(){
    this.settask=function(){
        return {ok:true};
    };
    this.gettask=function(){
        return {ok:true};
    };
    this.removetask=function(){
        return {ok:true};
    };
};

planner.prototype=new scheduler();
planner.prototype.count=Number.POSITIVE_INFINITY;

planner.prototype.task=function(repeat,stop){
    console.log('duh!');
    repeat();
}

server.set(3000);
server.listen(new planner());
server.run();

exports.app=server.app;

