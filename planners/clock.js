'use strict';

var server=require('./functions/server')
  , planner=require('./functions/planner')

var task=function(){
    console.log(Date.now());
}

server(planner(task,Number.POSITIVE_INFINITY,1000),3001);

exports.app=server.app;
exports.messages=server.messages;

