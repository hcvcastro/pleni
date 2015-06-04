'use strict';

var mongoose=require('mongoose')
  , Schema=mongoose.Schema

var planner=new Schema({
    id:String
  , planner:{
        host:{
            type:String
          , required:true
          , lowercase:true
        }
      , port:Number
      , tid:{
            type:String
          , required:false
        }
    }
});

module.exports=mongoose.model('Planner',planner);

