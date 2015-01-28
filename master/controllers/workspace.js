'use strict';

var validate=require('../../planners/utils/validators')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , schema=require('../utils/schema')
  , get_element=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].id==needle){
                return [i,haystack[i]];
            }
        }
        return;
    };

module.exports=function(app){
    app.get('/workspace/view',function(request,response){
        response.render('pages/workspace');
    });

    app.get('/workspace/:project/:repository',function(request,response){
        var id_p=validate.toString(request.params.project)
          , id_r=validate.toString(request.params.repository)
          , project=get_element(id_p,app.get('projects'))
    });
};

