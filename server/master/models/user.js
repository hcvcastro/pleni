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
        type:{
            type:String
          , required:true
          , default:'inactive'
          , enum:['confirm','forgot','active','inactive']
        }
      , key:{
            type:String
          , required:false
        }
      , ts:{
            type:Date
          , default:Date.now
        }
    }
  , resources:{
        dbservers:[{
            id:String
          , attrs:{
                virtual:Boolean
              , readable:Boolean
              , writable:Boolean
            }
          , db:{
                host:String
              , port:Number
              , user:String
              , pass:String
              , prefix:String
            }
        }]
      , repositories:[{
            id:String
          , _dbserver:String
          , db:{
                name:String
            }
        }]
      , planners:[{
            id:String
          , attrs:{
                virtual:Boolean
              , readable:Boolean
              , writable:Boolean
            }
          , planner:{
                host:String
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
            }
        }]
      , notifiers:[{
            id:String
          , attrs:{
                virtual:Boolean
              , readable:Boolean
              , writable:Boolean
            }
          , notifier:{
                host:String
              , port:Number
            }
        }]
    }
  , notifier:[{
        id:String
      , planner:{
            host:String
          , port:Number
        }
    }]
  , projects:[{
        id:String
      , _repositories:[String]
    }]
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

