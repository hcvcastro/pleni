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

exports.VPlanner=mongoose.model('VPlanner',planner);
exports.RPlanner=mongoose.model('RPlanner',planner);

