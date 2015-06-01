'use strict';

var validate=require('../../core/validators')
  , _sucess=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , schema=require('../../core/schema')

module.exports=function(app){
    app.get('/_session',function(request,response){
        if(schema.js.validate(request.body,schema.auth).length==0){
            var user=validate.toString(request.body.user)
              , pass=validate.toString(request.body.password)

            console.log('valid');
        }else{
            response.status(401).json(_error.auth);
        }
    });
};

