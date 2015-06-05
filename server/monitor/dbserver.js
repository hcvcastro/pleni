'use strict';

var _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , schema=require('../../core/schema')
  , Client=require('./models/client')
  , DBServer=require('./models/dbserver')
  , User=require('./models/user')

module.exports=function(app){
    app.get('/dbserver',function(request,response){
        response.status(200).json({
            "couchdb":"Welcome"
        });
    });

    app.post('/dbserver/_session',function(request,response){
        if(schema.js.validate(request.body,schema.auth2).length==0){
            Client.findOne({key:request.body.password},function(err,client){
                if(client){
                    response.cookie('AuthSession','asdf',{
                        path:'/'
                      , httpOnly:true
                    }).status(200).json(_success.ok);
                }else{
                    response.cookie('AuthSession','',{
                        path:'/'
                      , httpOnly:true
                    }).status(401).json(_error.auth);
                }
            });
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.get('/dbserver/_all_dbs',function(request,response){
        console.log(request);
        response.status(200).json([]);
    });
};

