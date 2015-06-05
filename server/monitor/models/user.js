'use strict';

var mongoose=require('mongoose')
  , Schema=mongoose.Schema
  , ObjectId=Schema.ObjectId

var user=new Schema({
    id:String
  , client:{
        type:ObjectId
      , ref:'Client'
    }
  , dbservers:[{
        type:ObjectId
      , ref:'DBServer'
    }]
});

module.exports=mongoose.model('User',user);

