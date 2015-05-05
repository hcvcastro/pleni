'use strict';

var mongoose=require('mongoose')
  , Schema=mongoose.Schema
  , bcrypt=require('bcrypt')
  , SALT_WORK_FACTOR=16

var user=new Schema({
    email:{
        type:String
      , required:true
      , unique:true
      , lowercase:true
    }
  , password:{
        type:String
      , required:true
    }
  , status:{
        type:String
      , required:true
      , default:'inactive'
    }
});

user.pre('save',function(next){
    var user=this;

    if(!user.isModified('password')){
        return next();
    }

    bcrypt.genSalt(SALT_WORK_FACTOR,function(err,salt){
        if(err){
            return next(err);
        }

        bcrypt.hash(user.password,salt,function(err,hash){
            if(err){
                return next(err);
            }

            user.password=hash;
            next();
        });
    });
});

user.methods.comparePassword=function(password,next){
    bcrypt.compare(password,this.password,function(err,match){
        if(err){
            return next(err);
        }

        next(null,match);
    });
};

module.exports=mongoose.model('User',user);

