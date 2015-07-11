'use strict';

var mongoose=require('mongoose')
  , Schema=mongoose.Schema
  , ObjectId=Schema.ObjectId

var user=new Schema({
    id:String
  , app:String
  , repositories:[{
        name:String
      , dbserver:String
    }]
  , tasks:[{
        seed:String
      , tid:String
      , status:String
      , name:String
      , count:Number
      , interval:Number
    }]
  , settings:{
        max_tasks:Number
    }
});

module.exports=mongoose.model('User',user);

