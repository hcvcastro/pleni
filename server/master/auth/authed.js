'use strict';

var _error=require('../../../core/json-response').error

module.exports=function(request,response,next){
    if(request.isAuthenticated()){
        return next();
    }
    
    response.status(401).json(_error.auth);
}

