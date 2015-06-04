'use strict';

var mongoose=require('mongoose')
  , Schema=mongoose.Schema

var dbserver=new Schema({
    id:String
  , db:{
        host:{
            type:String
          , required:true
          , lowercase:true
        }
      , port:Number
      , user:String
      , pass:String
      , prefix:String
    }
});

module.exports=mongoose.model('DBServer',dbserver);

