'use strict';

var mongoose=require('mongoose')
  , Schema=mongoose.Schema
  , ObjectId=Schema.ObjectId

var user=new Schema({
    id:String
  , client:String
  , repositories:[{
        type:String
    }]
});

module.exports=mongoose.model('User',user);

