'use strict';

module.exports=function(config,user){
    return {
        resources:{
            dbservers:[{
                id:'pleni'
              , attrs:{
                    virtual:true
                  , readable:true
                  , writable:false
                }
              , db:{
                    host:config.monitor.url
                  , port:config.monitor.port
                  , user:user
                  , pass:config.monitor.apikey
                  , prefix:''
                }
            }]
          , repositories:[]
          , planners:[{
                id:'pleni0'
              , attrs:{
                    virtual:true
                  , readable:true
                  , writable:false
                }
              , planner:{
                    host:config.monitor.url
                  , port:config.monitor.port
                  , user:user
                  , pass:config.monitor.apikey
                }
            }]
          , notifiers:[{
                id:'master'
              , attrs:{
                    virtual:false
                  , readable:true
                  , writable:false
                }
              , notifier:{
                    host:config.base.url
                  , port:config.base.port
                }
            }]
        }
      , notifier:[]
      , projects:[]
    };
};

