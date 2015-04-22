'use strict';

var request=require('request')
  , generator=require('../../core/functions/utils/random').sync
  , config=require('../../config/sites')

exports.getplanner=function(task,done){
    var url=config.monitor.host+':'+config.monitor.port+'/tasks'
console.log('sending PUT request to',url);
    request.put({
        url:url
      , json:{task:task}
    },function(error,response){
        console.log('return from request');
        if(error){
            console.log(error);
            done({});
        }else{
            done(response.body);
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

