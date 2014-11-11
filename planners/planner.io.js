'use strict';

var planner=require('./planner')
  , http=planner.http
  , io=require('socket.io')(http)

io.on('connection',function(socket){
    console.log('a user connected');
});

