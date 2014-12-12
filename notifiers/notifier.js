'use strict';

var http=require('http')
  , express=require('express')
  , join=require('path').join
  , bodyparser=require('body-parser')
  , app=express()
  , server=http.Server(app)
  , ios=require('socket.io')(server)
  , ioc=require('socket.io-client')

app.set('port',process.env.PORT||3002);
app.set('views',join(__dirname,'views'));
app.disable('x-powered-by');

app.use(bodyparser.json());
app.use(express.static(join(__dirname,'public')));
app.use(express.static(join(__dirname,'..','bower_components')));

app.get('/',function(request,response){
    response.json({
        notifier:'ready for action'
    });
});
app.get('/msg.html',function(request,response){
    response.sendFile(join(__dirname,'public','msg.html'));
});

ios.sockets.on('connection',function(socket){
    socket.emit('notifier',{
        notifier:{
            action:'connection'
        }
    });
});

var socket=ioc.connect('http://localhost:3001',{reconnect:true});
socket.on('connection',function(msg){
    ios.emit('notifier',msg);
});
socket.on('notifier',function(msg){
    ios.emit('notifier',msg);
});

server.listen(app.get('port'),function(){
    console.log('Notifier APP listening on port '+app.get('port'));
});

module.exports=app;

