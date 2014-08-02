'use strict';

global.app={};

var express=require('express')
  , favicon=require('serve-favicon')
  , bodyparser=require('body-parser')
  , fs=require('fs')
  , http=require('http')
  , path=require('path')
  , app=express();

app.set('port',process.env.PORT||3000);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','jade');

// read a database configuration
fs.readFile(path.join(__dirname,'database.json'),'utf8',function(err,data){
    if(err){throw err;}
    global.app.db=JSON.parse(data);
});

app.disable('x-powered-by');
app.use(favicon(path.join(__dirname,'..','public','img','favicon.ico')));

//app.use(express.methodOverride());

app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json())

app.use(require('stylus').middleware({
    src:path.join(__dirname,'stylus'),
    dest:path.join(__dirname,'..','public','css'),
    compress:true
}));

app.use(express.static(path.join(__dirname,'..','public')));
app.use(express.static(path.join(__dirname,'..','bower_components')));
app.locals.pretty=true;

require('./routes')(app);
app.use(function(req,res){
    res.status(404).render('404.jade',{
        title:'404',
        message:'Sorry XD, but file not found!!'
    });
});

http.createServer(app).listen(app.get('port'),function(){
    console.log('Express server listening on port '+app.get('port'));
});
