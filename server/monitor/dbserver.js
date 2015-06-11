'use strict';

var _request=require('request')
  , validate=require('../../core/validators')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , schema=require('../../core/schema')
  , Client=require('./models/client')
  , DBServer=require('./models/dbserver')
  , User=require('./models/user')
  , generator=require('../../core/functions/utils/random').sync
  , test=require('../../core/functions/databases/test')
  , auth=require('../../core/functions/databases/auth')
  , create=require('../../core/functions/databases/create')

module.exports=function(app,config){
    var redis=app.get('redis')

    app.get('/dbserver',function(request,response){
        response.status(200).json({
            "couchdb":"Welcome"
        });
    });

    app.post('/dbserver/_session',function(request,response){
        if(schema.js.validate(request.body,schema.auth2).length==0){
            var userid=validate.toString(request.body.name)
              , apikey=validate.toString(request.body.password)

            redis.hget('monitor:clients',apikey,function(err,reply){
                if(err){
                    console.log(err);
                }

                if(reply){
                    var cookie=generator()
                    User.findOne({id:userid,client:reply},function(err,user){
                        var data=JSON.stringify({
                            id:userid
                          , repositories:[]
                        })

                        if(user){
                            data=JSON.stringify({
                                id:userid
                              , repositories:user.repositories
                            });
                        }

                        redis.setex('user:'+cookie,60*5,data,
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

    var authed=function(request,response,next){
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

    var cookie=function(key,done){
        redis.hget('monitor:cookies',key,function(err,reply){
            if(err){
                console.log(err);
            }
            var json=JSON.parse(reply);
            if((+Date.now()- +json.ts)>500000){
                done(json.cookie);
            }else{
                redis.hget('monitor:dbservers',key,function(err,reply){
                    if(err){
                        console.log(err);
                    }
                    if(reply){
                        var db=JSON.parse(reply);
                        test({
                            id:key
                          , db:{
                                host:db.host+':'+db.port
                              , user:db.user
                              , pass:db.pass
                              , prefix:db.prefix
                        }})
                        .then(auth)
                        .then(function(args){
                            redis.hset('monitor:cookies',key,args.auth,
                            function(err,reply){
                                if(err){
                                    console.log(err);
                                }
                                done(args.auth.cookie);
                            });
                        })
                        .fail(function(error){
                            console.log(error);
                            done(null);
                        })
                        .done();
                    }
                });
            }
        });
    };

    app.get('/dbserver/_all_dbs',authed,function(request,response){
        response.status(200).json(request.reply.repositories);
    });

    app.put('/dbserver/:repository',authed,function(request,response){
        redis.hkeys('monitor:dbservers',function(err,dbservers){
            if(err){
                console.log(err);
            }
            if(dbservers){
                var key=dbservers[Math.floor(Math.random()*dbservers.length)]
                cookie(key,function(cookie){
                    if(!cookie){
                        response.status(401).json(_error.auth);
                    }else{
                        redis.hget('monitor:dbservers',key,function(err,reply){
                            if(err){
                                console.log(err);
                            }
                            var db=JSON.parse(reply)
                              , name=db.prefix+request.reply.id+'_'
                                    +request.params.repository

                            _request.put({
                                url:db.host+':'+db.port+'/'+name
                              , headers:{
                                    'Cookie':cookie
                                  , 'X-CouchDB-WWW-Authenticate':'Cookie'
                                }
                            },function(error,reply){
                                if(reply.statusCode==201){
                                    redis.hset('monitor:repositorydb',name,key,
                                    function(err,reply){
                                        if(err){
                                            console.log(reply);
                                        }
                                    });
                                    var info=JSON.stringify({
                                        db_name:name
                                      , doc_count:0
                                      , doc_del_count:0
                                      , update_seq:0
                                      , purge_seq:0
                                      , compact_running:false
                                      , disk_size:79
                                      , data_size:0
                                      , instance_start_time:Date.now()*1000
                                      , disk_format_version:6
                                      , committed_update_seq:0
                                    })

                                    redis.hset('monitor:repositories',name,info,
                                    function(err,reply){
                                        if(err){
                                            console.log(reply);
                                        }
                                    });
                                }

                                User.findOneAndUpdate({
                                    id:request.reply.id
                                },{
                                    $set:{
                                        repositories:request.reply.repositories
                                    }
                                },function(err,user){
                                    response.status(reply.statusCode)
                                        .json(reply.body);
                                });
                            });
                        });
                    }
                });
            }else{
                response.status(401).json(_error.auth);
            }
        });
    });

    app.put('/dbserver/:repository/:document',authed,function(request,response){
        response.status(400).json(_error.json);
    });
};

