'use strict';

module.exports=function(config){
    return {
        resources:{
            dbservers:[]
          , repositories:[]
          , planners:[]
          , notifiers:[{
                id:'master'
              , attrs:{
                    virtual:false
                  , readable:true
                  , writable:false
                }
              , notifier:{
                    host:config.url
                  , port:80
                }
            }]
        }
      , notifier:[]
      , projects:[]
    };
};

