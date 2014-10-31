'use strict';

var server=require('./abstracts/server')
  , scheduler=require('./abstracts/scheduler')
  , ok={ok:true}

var planner=function(){
    this.api=    function(request,response){response.status(200).json({})}
    this.create= function(request,response){response.status(200).json(ok)}
    this.remove= function(request,response){response.status(200).json(ok)}
    this.get=    function(request,response){response.status(200).json(ok)}
};

planner.prototype=new scheduler(function(repeat,stop){
    setTimeout(function(){
        console.log('duh');
    }, 1000);
    repeat();
},30,0);

server.set(process.env.PORT||3001);
server.listen(new planner());
server.run();

module.exports=planner;
module.exports.app=server.app;

