'use strict';

var generator=require('../../core/functions/utils/random').sync
  , request=require('request')

exports.getplanner=function(task,done){
    request.put({
        url:'http://localhost:3003/tasks'
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
        url:'http://localhost:3003/tasks'
      , json:{task:task}
    },function(error,response){
        if(error){
            console.log(error);
        }
    });
}

exports.getrepository=function(){
    return {
        host:'http://localhost:5984'
      , user:'jacobian'
      , pass:'asdf'
      , name:'pleni_site_qs_'+generator()
    }
}

