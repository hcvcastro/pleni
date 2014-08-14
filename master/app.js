'use strict';

var express=require('express')
  , favicon=require('serve-favicon')
  , bodyparser=require('body-parser')
  , http=require('http')
  , path=require('path')
  , app=express()

app.set('port',process.env.PORT||3000);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','jade');
app.disable('x-powered-by');
app.use(favicon(path.join(__dirname,'..','public','img','favicon.ico')));
app.use(bodyparser.json());

app.use(require('stylus').middleware({
    src:path.join(__dirname,'stylus'),
    dest:path.join(__dirname,'..','public','css'),
    compress:true
}));

app.use(express.static(path.join(__dirname,'..','public')));
app.use(express.static(path.join(__dirname,'..','bower_components')));
app.locals.pretty=true;

require('./controllers/home')(app);
require('./controllers/repositories')(app);
require('./controllers/planners')(app);

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

