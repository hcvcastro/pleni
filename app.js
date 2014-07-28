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
app.use(express.static(path.join(__dirname,'bower_components')));
app.locals.pretty=true;

if ('development'==app.get('env')){
    //app.use(express.errorHandler());
}

app.get('/',function(req,res){
    res.render('index')
});
app.get('/:page',function(req,res,next){
    var page=req.params.page;
    var contains = ['home','settings','fetch']
        .some(function(element,index,array){
            return element==page;
        });

    if(contains){
        res.render('pages/'+page);
    }else{
        next();
    }
});
app.use(function(req,res){
    res.status(404).render('404.jade',{
        title:'404',
        message:'Sorry XD, but file not found!!'
    });
});

http.createServer(app).listen(app.get('port'),function(){
    console.log('Express server listening on port '+app.get('port'));
});

