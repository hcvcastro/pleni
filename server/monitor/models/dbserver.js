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

exports.VDBServer=mongoose.model('VDBServer',dbserver);
exports.RDBServer=mongoose.model('RDBServer',dbserver);

