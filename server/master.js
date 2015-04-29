'use strict';

var http=require('http')
  , express=require('express')
  , favicon=require('serve-favicon')
  , bodyparser=require('body-parser')
  , morgan=require('morgan')
  , lessmiddleware=require('less-middleware')
  , join=require('path').join
  , loadconfig=require('../core/loadconfig')
  , app=express()
  , server=http.Server(app)
  , ios=require('socket.io')(server)
  , ioc=require('socket.io-client')
  , config=require('../config/master')
  , mongoose=require('mongoose')
  , db=mongoose.connect(config.mongo.url)

  , resources={}
  , notifier=new Array()
  , projects=new Array()
  , user={
        role:'guest'
    }

// sync methods
resources.dbservers=loadconfig(join(__dirname,'..','config','dbservers.json'));
resources.repositories=loadconfig(join(__dirname,'..','config','repositories.json'));
resources.planners=loadconfig(join(__dirname,'..','config','planners.json'));
resources.notifiers=loadconfig(join(__dirname,'..','config','notifiers.json'));
projects=loadconfig(join(__dirname,'..','config','projects.json'));

app.set('resources',resources);
app.set('notifier',notifier);
app.set('projects',projects);

app.set('host',config.master.host);
app.set('port',config.master.port);
app.disable('x-powered-by');
app.use(bodyparser.json());

if(config.env=='production'){
    app.use(favicon(join(__dirname,'..','client','favicon.ico')));
    app.use(express.static(join(__dirname,'..','client')));
    app.use(morgan('combined'));
}else{
    app.use(favicon(join(__dirname,'..','client','favicon.ico')));
    app.set('views',join(__dirname,'..','client','views','master'));
    app.set('view engine','jade');

    app.use(lessmiddleware('/less',{
        dest:'/css'
      , pathRoot:join(__dirname,'..','client')
      , compress:true
    }));

    app.use(express.static(join(__dirname,'..','client')));
    app.use(express.static(join(__dirname,'..','bower_components')));
    app.locals.pretty=true;

    app.use(morgan('dev'));
}

require('./master/home')(app,user);
require('./master/auth')(app,user);

require('./master/resources')(app);
require('./master/resources/dbservers')(app);
require('./master/resources/repositories')(app);
require('./master/resources/planners')(app);
require('./master/resources/notifiers')(app);
require('./master/notifier')(app,ios,ioc);
require('./master/projects')(app);
require('./master/workspace')(app);

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

server.listen(app.get('port'),app.get('host'),function(){
    console.log('pleni ✯ master: listening on '
        +app.get('host')+':'+app.get('port')+'\n');
});

module.exports=app;

