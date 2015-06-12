'use strict';

var mongoose=require('mongoose')
  , Schema=mongoose.Schema

var app=new Schema({
    id:String
  , key:String
});

module.exports=mongoose.model('App',app);

