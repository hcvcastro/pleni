'use strict';

var mongoose=require('mongoose')
  , Schema=mongoose.Schema

var planner=new Schema({
    id:String
  , host:{
        type:String
      , required:true
      , lowercase:true
    }
  , port:Number
  , tid:{
        type:String
      , required:false
    }
  , status:{
        type:String
      , required:false
      , default:'stopped'
      , enum:['running','stopped']
    }
});

module.exports=mongoose.model('Planner',planner);

