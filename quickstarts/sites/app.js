'use strict';

var http=require('http')
  , express=require('express')
  , favicon=require('serve-favicon')
  , bodyparser=require('body-parser')
  , lessmiddleware=require('less-middleware')
  , join=require('path').join
  , app=express()
  , server=http.Server(app)
  , ios=require('socket.io')(server)
  , ioc=require('socket.io-client')
  , notifier=new Array()

// async methods
app.set('port',process.env.PORT||3003);
app.set('views',join(__dirname,'views'));
app.set('view engine','jade');
app.disable('x-powered-by');
app.use(favicon(join(__dirname,'..','..','master','public','img','favicon.ico')));
app.use(bodyparser.json());

app.use(lessmiddleware('/less',{
    dest:'/css'
  , pathRoot:join(__dirname,'public')
  , compress:true
}));

app.use(express.static(join(__dirname,'public')));
app.use(express.static(join(__dirname,'..','..','master','public')));
app.use(express.static(join(__dirname,'..','..','bower_components')));
app.locals.pretty=true;

app.get('/',function(request,response){
    response.render('index');
});
app.get('/sites',function(request,response){
    response.render('pages/sites');
});

app.use(function(request,response){
    response.status(404).render('404.jade',{
        title:'404',
        message:'I\'m so sorry, but file not found!!'
    });
});

ios.sockets.on('connection',function(socket){
    socket.emit('notifier',{
        action:'connection'
    });
});

server.listen(app.get('port'),function(){
    console.log('Master APP listening on port '+app.get('port'));
});

module.exports=app;

