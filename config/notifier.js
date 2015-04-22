'use strict';

module.exports={
    env:process.env.ENV||'production'
  , notifier:{
        host:process.env.OPENSHIFT_NODEJS_IP||'localhost'
      , port:process.env.OPENSHIFT_NODEJS_PORT||process.env.PORT||3002
    }
};

