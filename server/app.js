'use strict';

global.app={};

var express=require('express')
  , fs=require('fs')
  , http=require('http')
  , path=require('path')
  , app=express();

app.set('port',process.env.PORT||3000);
app.set('views',__dirname+'/views');
app.set('view engine','jade');

fs.readFile(__dirname+'/database.json','utf8',function(err,data){
    if(err){throw err;}
    global.app.db=JSON.parse(data);
});

//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.bodyParser());
//app.use(express.methodOverride());
//app.use(app.router);

app.use(require('stylus').middleware({
    src:path.join(__dirname,'stylus'),
    dest:path.join(__dirname,'/../public/css'),
    compress:true
}));

app.use(express.static(path.join(__dirname,'/../public')));
app.use(express.static(path.join(__dirname,'/../bower_components')));
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

