'use strict';

var http=require('http')
  , express=require('express')
  , favicon=require('serve-favicon')
  , bodyparser=require('body-parser')
  , lessmiddleware=require('less-middleware')
  , join=require('path').join
  , loadconfig=require('./utils/loadconfig')
  , app=express()
  , server=http.Server(app)
  , ios=require('socket.io')(server)
  , ioc=require('socket.io-client')
  , resources={}
  , notifier=new Array()
  , projects=new Array()

// sync methods
resources.dbservers=loadconfig(join(__dirname,'config','dbservers.json'));
resources.repositories=loadconfig(join(__dirname,'config','repositories.json'));
resources.planners=loadconfig(join(__dirname,'config','planners.json'));
resources.notifiers=loadconfig(join(__dirname,'config','notifiers.json'));
projects=loadconfig(join(__dirname,'config','projects.json'));

app.set('resources',resources);
app.set('notifier',notifier);
app.set('projects',projects);

// async methods
app.set('port',process.env.PORT||3000);
app.set('views',join(__dirname,'views'));
app.set('view engine','jade');
app.disable('x-powered-by');
app.use(favicon(join(__dirname,'public','img','favicon.ico')));
app.use(bodyparser.json());

app.use(lessmiddleware('/less',{
    dest:'/css'
  , pathRoot:join(__dirname,'public')
  , compress:true
}));

app.use(express.static(join(__dirname,'public')));
app.use(express.static(join(__dirname,'..','bower_components')));
app.locals.pretty=true;

require('./controllers/home')(app);
require('./controllers/resources')(app);
require('./controllers/resources/dbservers')(app);
require('./controllers/resources/repositories')(app);
require('./controllers/resources/planners')(app);
require('./controllers/resources/notifiers')(app);
require('./controllers/notifier')(app,ios,ioc);
require('./controllers/projects')(app);

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

