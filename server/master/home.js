'use strict';

var fs=require('fs')
  , join=require('path').join
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error

module.exports=function(app){
    app.get('/',function(request,response){
        if(request.user){
            response.cookie('pleni.auth',JSON.stringify({
                role:'user'
            }));
        }
        response.render('dev');
    });

    app.get('/home',function(request,response){
        response.render('pages/home');
    });

    app.get('/static/:page',function(request,response){
        var base=join(__dirname,'..','..','client','views','master','static');

        fs.readdir(base,function(err,files){
            if(!err&&files.some(function(file){
                return file.substring(0,file.length-5)===request.params.page;
            })){
                response.render('static/'+request.params.page);
            }else{
                response.status(404).json(_error.notfound);
            }
        });
    });
};

