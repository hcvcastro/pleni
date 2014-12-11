'use strict';

var http=require('http')
  , express=require('express')
  , join=require('path').join
  , bodyparser=require('body-parser')
  , app=express()
  , server=http.Server(app)
  , io=require('socket.io')(server)

app.set('port',process.env.PORT||3002);
app.set('views',join(__dirname,'views'));
app.disable('x-powered-by');

app.use(bodyparser.json());
app.use(express.static(join(__dirname,'public')));
app.use(express.static(join(__dirname,'..','bower_components')));
app.get('/',function(request,response){
    response.sendFile(join(__dirname,'public','msg.html'));
});

io.sockets.on('connection',function(socket){
    socket.emit('notifier',{
        notifier:{
            action:'connection'
        }
    });
});

server.listen(app.get('port'),function(){
    console.log('Notifier APP listening on port '+app.get('port'));
});

module.exports=app;

