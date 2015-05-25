'use strict';

var fs=require('fs')
  , join=require('path').join
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error

module.exports=function(app,config){
    app.get('/',function(request,response){
        if(request.user){
            response.cookie('pleni.monitr.auth',JSON.stringify({
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
};

