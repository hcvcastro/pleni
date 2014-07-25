'use strict';

var express=require('express')
  , http=require('http')
  , path=require('path');

var app=express();

app.set('port',process.env.PORT||3000);
app.set('views',__dirname+'/views');
app.set('view engine','jade');

//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.bodyParser());
//app.use(express.methodOverride());
//app.use(app.router);

app.use(require('stylus').middleware({
    src:path.join(__dirname,'stylus'),
    dest:path.join(__dirname,'public/css'),
    compress:true
}));

app.use(express.static(path.join(__dirname,'public')));
app.locals.pretty=true;

if ('development'==app.get('env')){
    //app.use(express.errorHandler());
}

app.get('/',function(req,res){res.render('index')});
app.get('/settings',function(req,res){res.render('settings')});
app.get('/fetch',function(req,res){res.render('fetch')});

app.use(function(req,res){
    res.status(404).render('404.jade',{title:'404',message:'File not found!!'});
});

http.createServer(app).listen(app.get('port'),function(){
    console.log('Express server listening on port '+app.get('port'));
});

