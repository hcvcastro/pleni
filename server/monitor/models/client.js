'use strict';

var mongoose=require('mongoose')
  , Schema=mongoose.Schema

var client=new Schema({
    id:String
  , key:String
});

module.exports=mongoose.model('Client',client);

