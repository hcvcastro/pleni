'use strict';

module.exports={
    env:process.env.ENV||'production'
  , master:{
        host:process.env.OPENSHIFT_NODEJS_IP||'localhost'
      , port:process.env.OPENSHIFT_NODEJS_PORT||process.env.PORT||3004
    }
  , mongo:{
        url:'mongodb://localhost/pleni'
    }
};

