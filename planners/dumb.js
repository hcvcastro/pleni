'use strict';

var server=require('./abstracts/server')

this._status='stopped';

this.status=function(){
    return {ok:true,status:this._status};
};
this.run=function(){
    return {ok:true,run:this.qwer};
};
this.stop=function(){
    return {ok:true};
};

this.addtask=function(){
    return {ok:true};
};
this.gettask=function(){
    return {ok:true};
};
this.removetask=function(){
    return {ok:true};
};

server.set(3000);
server.listen(this);
server.run();

//  , planner=require('./functions/planner')
//server(planner(task,1,1000),3001);
//exports.app=server.app;
//exports.messages=server.messages;

