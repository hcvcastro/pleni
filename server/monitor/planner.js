'use strict';

var _request=require('request')
  , validate=require('../../core/validators')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , schema=require('../../core/schema')
  , User=require('./models/user')
  , generator=require('../../core/functions/utils/random').sync
  , sort=require('../../core/utils').sort2
  , test=require('../../core/functions/planners/test')
  , auth=require('../../core/functions/planners/auth')

module.exports=function(app,config){
    var redis=app.get('redis')
      , cookie=function(header){
            var regex=/^AuthSession=([a-z0-9-]+).*$/
              , exec=regex.exec(header)

            if(exec){
                return exec[1];
            }
        }
      , authed=function(request,response,next){
            var _auth=cookie(request.headers.cookie)

            if(_auth){
                redis.get('user:'+_auth,function(err,reply){
                    if(err){
                        console.log(err);
                    }
                    if(reply){
                        request.user=JSON.parse(reply);
                        return next();
                    }else{
                        response.status(401).json(_error.auth);
                    }
                });
            }else{
                response.status(401).json(_error.auth);
            }
        }

    app.get('/planner/id',function(request,response){
        response.status(200).json({
            planner:'ready for action'
          , type:'virtual'
        });
    });

    app.post('/planner/_session',function(request,response){
        if(schema.js.validate(request.body,schema.auth2).length==0){
            var userid=validate.toString(request.body.name)
              , apikey=validate.toString(request.body.password)

            redis.hget('monitor:apps',apikey,function(err,appid){
                if(err){
                    console.log(err);
                }

                if(appid){
                    User.findOne({id:userid,app:appid},function(err,user){
                        var cookie=generator()
                          , data={
                                id:userid
                              , app:appid
                            }

                        redis.setex('user:'+cookie,60*5,JSON.stringify(data),
                        function(err,reply){
                            response.cookie('AuthSession',cookie,{
                                path:'/'
                              , httponly:true
                            }).status(200).json(_success.ok);
                        });
                    });
                }else{
                    response.cookie('AuthSession','',{
                        path:'/'
                      , httpOnly:true
                    }).status(401).json(_error.auth);
                }
            });
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.get('/planner/_api',function(request,response){
        redis.hgetall('monitor:apis',function(err,reply){
            if(err){
                console.log(err);
            }

            var result=[]

            for(var i in reply){
                result.push({
                    name:i
                  , reply:reply[i].schema
                });
            }

            result.sort(sort);
            response.status(200).json(result);
        });
    });

    app.post('/planner',authed,function(request,response){
        response.status(403).json(_error.validation);
    });

    app.get('/planner/_status',authed,function(request,response){
        response.status(200).json({
            status:'stopped'
        });
    });
};

