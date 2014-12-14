'use strict';

var http=require('http')
  , express=require('express')
  , bodyparser=require('body-parser')
  , join=require('path').join
  , app=express()
  , server=http.Server(app)
  , ios=require('socket.io')(server)
  , ioc=require('socket.io-client')
  , notifiers=new Array()

app.set('notifiers',notifiers);
app.set('port',process.env.PORT||3002);
app.set('views',join(__dirname,'views'));
app.disable('x-powered-by');

app.use(bodyparser.json());
app.use(express.static(join(__dirname,'public')));
app.use(express.static(join(__dirname,'..','bower_components')));

require('./controllers/basic')(app);
require('./controllers/collection')(app,ios,ioc);
require('./controllers/element')(app,ios,ioc);

ios.sockets.on('connection',function(socket){
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

