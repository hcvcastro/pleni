'use strict';

var fs=require('fs')
  , join=require('path').join
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error

module.exports=function(app,config){
    app.get('/',function(request,response){
        if(request.user){
            response.cookie('pleni.mastr.auth',JSON.stringify({
                role:'user'
            }));
        }

        if(config.env=='production'){
            response.status(200)
                .sendFile(join(__dirname,'..','..','client','index.html'));
        }else{
            response.status(200).render('dev');
        }
    });

    app.get('/home',function(request,response){
        if(request.user){
            response.cookie('pleni.mastr.auth',JSON.stringify({
                role:'user'
            }));
        }

        if(config.env=='production'){
            response.status(200)
                .sendFile(join(__dirname,'..','..','client','home.html'));
        }else{
            response.status(200).render('pages/home');
        }
    });

    app.get('/static/:page',function(request,response){
        var base=''

        if(config.env=='production'){
            base=join(__dirname,'..','..','client','static');
        }else{
            base=join(__dirname,'..','..','client','views','master','static');
        }

        fs.readdir(base,function(err,files){
            if(!err&&files.some(function(file){
                return file.substring(0,file.length-5)===request.params.page;
            })){
                if(config.env=='production'){
                    response.status(200)
                        .sendFile(join(__dirname,'..','..','client','static',
                            request.params.page+'.html'));
                }else{
                    response.render('static/'+request.params.page);
                }
            }else{
                response.status(404).json(_error.notfound);
            }
        });
    });
};

