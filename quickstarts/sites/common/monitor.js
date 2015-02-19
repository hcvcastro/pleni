'use strict';

var generator=require('../../../planners/functions/utils/random').sync
  , request=require('request')

exports.getplanner=function(task){
    request.put({
        url:'http://localhost:3004/tasks'
      , json:{task:task}
    },function(error,response){
        if(error){
            console.log(error);
        }
    });
}

exports.freeplanner=function(task){
    request.delete({
        url:'http://localhost:3004/tasks'
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

