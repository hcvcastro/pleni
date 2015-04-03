'use strict';

module.exports={
    env:process.env.ENV||'test'
  , db:{
        host:'http://localhost'
      , port:5984
      , user:'jacobian'
      , pass:'asdf'
      , prefix:'test_'
    }
  , notifiers:[{
        script:'server/notifier.io'
      , host:'http://localhost'
      , port:3002
    },{
        script:'server/master'
      , host:'http://localhost'
      , port:3000
    }]
  , planners:[{
        script:'server/planner'
      , host:'http://localhost'
      , port:3001
    },{
        script:'server/planner.io'
      , host:'http://localhost'
      , port:3001
    },{
        script:'server/planner.ion'
      , host:'http://localhost'
      , port:3001
    }]
};

