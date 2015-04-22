'use strict';

module.exports={
    env:process.env.ENV||'production'
  , redis:{
        host:'localhost'
      , port:6379
      , options:{
            no_ready_check:true
          , auth_pass:'~~{{~~æßðđł[¶]æßðŋħ]]]}}}}~~'
        }
    }
  , monitor:{
        host:process.env.OPENSHIFT_NODEJS_IP||'localhost'
      , port:process.env.OPENSHIFT_NODEJS_PORT||process.env.PORT||3003
    }
};

