'use strict';

module.exports={
    env:process.env.ENV||'production'
  , cookie:{
        secret:'pleni'
      , maxAge:3*60*60*1000
      , name:'pleni.site.sid'
    }
  , redis:{
        host:'localhost'
      , port:6379
      , prefix:'sites:'
      , options:{
            no_ready_check:true
          , auth_pass:'~~{{~~æßðđł[¶]æßðŋħ]]]}}}}~~'
        }
    }
  , sites:{
        host:process.env.OPENSHIFT_NODEJS_IP||'localhost'
      , port:process.env.OPENSHIFT_NODEJS_PORT||process.env.PORT||3004
      , count:20
      , interval:1500
      , vhost:'http://localhost'
      , vport:3004
    }
  , monitor:{
        host:'http://localhost'
      , port:3003
    }
  , db:{
        host:'http://localhost'
      , port:5984
      , user:'pleni'
      , pass:'~~@[@ł€¶→}][þß~łĸ«»””n[þø||@#~½@~~~'
      , prefix:'pleni_sites_'
    }
};

