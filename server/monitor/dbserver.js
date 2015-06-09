'use strict';

var validate=require('../../core/validators')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , schema=require('../../core/schema')
  , Client=require('./models/client')
  , DBServer=require('./models/dbserver')
  , User=require('./models/user')
  , generator=require('../../core/functions/utils/random').sync

module.exports=function(app,config){
    var redis=app.get('redis')

    app.get('/dbserver',function(request,response){
        response.status(200).json({
            "couchdb":"Welcome"
        });
    });

    app.post('/dbserver/_session',function(request,response){
        if(schema.js.validate(request.body,schema.auth2).length==0){
            var user=validate.toString(request.body.user)
              , apikey=validate.toString(request.body.password)

            redis.hget('monitor:clients',apikey,function(err,reply){
                if(err){
                    console.log(err);
                }

                if(reply){
                    var cookie=generator()

                    User.findOne({id:user,client:reply},function(err,user){
                        var repositories=JSON.stringify([])

                        if(user){
                            repositories=JSON.stringify(user.repositories)
                        }

                        redis.setex('user:'+cookie,60*5,repositories,
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

    var auth=function(request,response,next){
        var regex=/^AuthSession=(.+) *$/
          , exec=regex.exec(request.headers.cookie)

        if(exec){
            redis.get('user:'+exec[1],function(err,reply){
                if(err){
                    console.log(err);
                }
                if(reply){
                    request.reply=JSON.parse(reply);
                    return next();
                }else{
                    response.status(401).json(_error.auth);
                }
            });
        }else{
            response.status(401).json(_error.auth);
        }
    };

    app.get('/dbserver/_all_dbs',auth,function(request,response){
        response.status(200).json(request.reply);
    });

    app.put('/dbserver/:repository',auth,function(request,response){
        redis.hkeys('monitor:dbservers',function(err,dbservers){
            if(err){
                console.log(err);
            }
            if(dbserver){
                var key=dbservers[Math.floor(Math.random()*dbservers.length)]
                
            }else{
                response.status(401).json(_error.auth);
            }
        });
    });
};

