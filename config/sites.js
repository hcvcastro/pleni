'use strict';

module.exports={
    env:process.env.ENV||'production'
  , cookie:{
        secret:'pleni'
      , maxAge:3*60*60*1000
      , name:'pleni.sid'
    }
  , redis:{
        host:'localhost'
      , port:6379
      , prefix:'sites:'
    }
  , sites:{
        host:'http://localhost'
      , port:process.env.PORT||3004
      , count:20
      , interval:1000
    }
  , monitor:{
        host:'http://localhost'
      , port:3003
    }
  , db:{
        host:'http://localhost'
      , port:5984
      , user:'jacobian'
      , pass:'asdf'
      , prefix:'pleni_sites_'
    }
};

