'use strict';

var _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error

module.exports=function(app){
    app.get('/dbserver',function(request,response){
        response.status(200).json({
            "couchdb":"Welcome"
        });
    });

    app.post('/dbserver/_session',function(request,response){
        console.log(request.body);
        response.cookie('AuthSession','asdf',{
            version:'1'
          , path:'/'
          , httpOnly:true
        }).status(401).json(_error.json);
    });
};

