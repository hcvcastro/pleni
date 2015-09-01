'use strict';

module.exports={
    env:process.env.ENV||'production'
  , planner:{
        host:process.env.OPENSHIFT_NODEJS_IP||'localhost'
      , port:process.env.OPENSHIFT_NODEJS_PORT||process.env.PORT||3001
    }
  , tasks:[
        'site/create'
      , 'site/fetch'
      , 'site/summarize'
      , 'site/remove'
    ]
};

