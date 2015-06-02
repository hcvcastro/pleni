'use strict';

module.exports={
    env:process.env.ENV||'production'
  , cookie:{
        secret:'monitor'
      , maxAge:3*60*60*1000
      , name:'pleni.monitor.sid'
    }
  , redis:{
        host:'localhost'
      , port:6379
      , prefix:'monitor:'
      , options:{
            no_ready_check:true
          , auth_pass:'~~{{~~æßðđł[¶]æßðŋħ]]]}}}}~~'
        }
    }
  , monitor:{
        host:process.env.OPENSHIFT_NODEJS_IP||'localhost'
      , port:process.env.OPENSHIFT_NODEJS_PORT||process.env.PORT||3003
      , email:'admin@localhost'
      , password:'asdf'
      , mongo:'mongodb://localhost/monitor'
    }
};

