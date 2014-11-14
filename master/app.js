'use strict';

var http=require('http')
  , express=require('express')
  , favicon=require('serve-favicon')
  , bodyparser=require('body-parser')
  , lessmiddleware=require('less-middleware')
  , join=require('path').join
  , loadconfig=require('./utils/loadconfig')
  , app=express()

// sync methods
app.set('repositories',
    loadconfig(join(__dirname,'config','dbservers.json')));
app.set('planners',
    loadconfig(join(__dirname,'config','planners.json')));

// async methods
app.set('port',process.env.PORT||3000);
app.set('views',join(__dirname,'views'));
app.set('view engine','jade');
app.disable('x-powered-by');
app.use(favicon(join(__dirname,'public','img','favicon.ico')));
app.use(bodyparser.json());

app.use(lessmiddleware(join(__dirname,'public'),{
    dest:join(__dirname,'public')
  , compress:true
}));

app.use(express.static(join(__dirname,'public')));
app.use(express.static(join(__dirname,'..','bower_components')));
app.locals.pretty=true;

require('./controllers/home')(app);
require('./controllers/resources')(app);
require('./controllers/tasks')(app);

app.use(function(req,res){
    res.status(404).render('404.jade',{
        title:'404',
        message:'I\'m so sorry, but file not found!!'
    });
});

http.createServer(app).listen(app.get('port'),function(){
    console.log('Express server listening on port '+app.get('port'));
});

module.exports=app;

