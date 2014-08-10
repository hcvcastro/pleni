'use strict';

var server=require('./functions/server')
  , planner=require('./functions/planner')

var task=function(){}

server(planner(task,1,1000),3001);

exports.app=server.app;
exports.messages=server.messages;

