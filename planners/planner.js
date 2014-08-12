'use strict';

var server=require('./abstracts/server')
  , scheduler=require('./abstracts/scheduler')
  , planner=new scheduler()
  , tid
  , name
  , action

planner.count=1;
planner.task=function(repeat,stop){
    console.log('duh!');
    stop();
}

planner.settask=function(name,action,response){
    if(tid===undefined){
        tid='asdfasdf'; // TODO need a random generator
        name=name;
        action=action;
        return {ok:true,tid:tid};
    }else{
        response.status(403);
        return {ok:false};
    }
};

planner.gettask=function(tid,response){
    if(tid===tid){
        return {ok:true,task:name};
    }else{
        response.status(404);
        return {ok:false};
    }
};

planner.removetask=function(tid,response){
    if(tid===tid){
        tid=undefined;
        name=undefined;
        action=undefined;
        return {ok:true};
    }else{
        response.status(404);
        return {ok:false};
    }
};

server.set(3000);
server.listen(planner);
server.run();

exports.app=server.app;

