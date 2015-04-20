'use strict';

module.exports={
    env:process.env.ENV||'production'
  , monitor:{
        host:'http://localhost'
      , port:process.env.PORT||3003
    }
};

