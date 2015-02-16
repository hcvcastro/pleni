'use strict';

var generator=require('../../../planners/functions/utils/random').sync

exports.getplanner=function(){
    return {
        host:'http://localhost'
      , port:3001
    }
}

exports.getrepository=function(){
    return {
        host:'http://localhost:5984'
      , user:'jacobian'
      , pass:'asdf'
      , name:'pleni_site_qs_'+generator()
    }
}

