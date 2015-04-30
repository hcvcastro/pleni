'use strict';

module.exports={
    env:process.env.ENV||'production'
  , cookie:{
        secret:'master'
      , maxAge:3*60*60*1000
      , name:'pleni.master.sid'
    }
  , redis:{
        host:'localhost'
      , port:6379
      , prefix:'master:'
      , options:{
            no_ready_check:true
          , auth_pass:'~~{{~~æßðđł[¶]æßðŋħ]]]}}}}~~'
        }
    }
  , master:{
        host:process.env.OPENSHIFT_NODEJS_IP||'localhost'
      , port:process.env.OPENSHIFT_NODEJS_PORT||process.env.PORT||3004
    }
  , mongo:{
        url:'mongodb://localhost/pleni'
    }
};

