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
  , validate=require('../../planners/utils/validators')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , planners=require('./planners')
  , notifier=new Array()
  , planner={
        host:'http://localhost'
      , port:3001
    }
  , db={
        host:'http://localhost:5984'
      , user:'jacobian'
      , pass:'asdf'
      , name:'pleni_site_qs_1'
    }

// async methods
app.set('port',process.env.PORT||3003);
app.set('views',join(__dirname,'views'));
app.set('view engine','jade');
app.disable('x-powered-by');
app.use(favicon(join(__dirname,'..','..','master','public','img','favicon.ico')));
app.use(bodyparser.json());

app.use(lessmiddleware('/less',{
    dest:'/css'
  , pathRoot:join(__dirname,'..','..','master','public')
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
app.put('/sites',function(request,response){
    var site=validate.toString(request.body.site)
    if(validate.validHost(site)){
        planners.create(planner,db,site);
        response.status(200).json(_success.ok);
    }else{
        response.status(403).json(_error.json);
    }
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

