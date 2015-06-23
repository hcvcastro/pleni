'use strict';

var _request=require('request')
  , validate=require('../../core/validators')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , schema=require('../../core/schema')
  , User=require('./models/user')
  , generator=require('../../core/functions/utils/random').sync
  , test=require('../../core/functions/planners/test')

module.exports=function(app,config){
    app.get('/planner/id',function(request,response){
        response.status(200).json({
            planner:'ready for action'
          , type:'io'
        });
    });

    app.get('/planner/_status',function(request,response){

    });
};

