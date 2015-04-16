'use strict';

module.exports={
    env:process.env.ENV||'production'
  , planner:{
        host:'http://localhost'
      , port:3001
    }
  , tasks:[
        'exclusive'
      , 'site/create'
      , 'site/fetch'
      , 'site/remove'
      , 'site/report'
      , 'site/summarize'
    ]
};

