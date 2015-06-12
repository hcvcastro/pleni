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
});

module.exports=mongoose.model('User',user);

