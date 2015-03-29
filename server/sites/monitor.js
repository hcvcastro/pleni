'use strict';

var request=require('request')
  , generator=require('../../core/functions/utils/random').sync
  , config=require('../../config/sites')

exports.getplanner=function(task,done){
    request.put({
        url:config.monitor.host+':'+config.monitor.port+'/tasks'
      , json:{task:task}
    },function(error,response){
        if(!error){
            done(response.body);
        }else{
            console.log(error);
        }
    });
}

exports.freeplanner=function(task){
    request.del({
        url:config.monitor.host+':'+config.monitor.port+'/tasks'
      , json:{task:task}
    },function(error,response){
        if(error){
            console.log(error);
        }
    });
}

exports.getrepository=function(){
    return {
        host:config.db.host+':'+config.db.port
      , user:config.db.user
      , pass:config.db.pass
      , name:config.db.prefix+generator()
    }
}

