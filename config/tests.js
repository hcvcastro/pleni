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
};

