'use strict';

var _request=require('request')
  , validate=require('../../core/validators')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , schema=require('../../core/schema')
  , App=require('./models/app')
  , DBServer=require('./models/dbserver')
  , User=require('./models/user')
  , generator=require('../../core/functions/utils/random').sync
  , test=require('../../core/functions/databases/test')
  , auth=require('../../core/functions/databases/auth')
  , create=require('../../core/functions/databases/create')

module.exports=function(app,config){
    var redis=app.get('redis')
      , cookie=function(header){
            var regex=/^AuthSession=(.+) *$/
              , exec=regex.exec(header)

            if(exec){
                return exec[1];
            }
        }
      , authed=function(request,response,next){
            var auth=cookie(request.headers.cookie)

            if(auth){
                redis.get('user:'+auth,function(err,reply){
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
      , dbauth=function(dbserverid,done){
            redis.hget('monitor:dbservers',dbserverid,function(err,_dbserver){
                if(err){
                    console.log(err);
                }

                if(_dbserver){
                    var dbserver=JSON.parse(_dbserver)

                    if(dbserver.auth&&dbserver.auth.ts&&
                        ((+Date.now()- +dbserver.auth.ts)<500000)){
                        done(dbserver);
                    }else{
                        test({
                            id:dbserverid
                          , db:{
                                host:dbserver.db.host+':'+dbserver.db.port
                              , user:dbserver.db.user
                              , pass:dbserver.db.pass
                              , prefix:dbserver.db.prefix
                            }
                        })
                        .then(auth)
                        .then(function(args){
                            dbserver.auth=args.auth;

                            redis.hset('monitor:dbservers',dbserverid,
                                JSON.stringify(dbserver),function(err,reply){
                                if(err){
                                    console.log(err);
                                }
                                done(dbserver);
                            });
                        })
                        .fail(function(error){
                            console.log(error);
                            done(null);
                        })
                        .done();
                    }
                }else{
                    done(null);
                }
            });
        }

    app.get('/dbserver',function(request,response){
        response.status(200).json({
            "couchdb":"Welcome"
        });
    });

    app.post('/dbserver/_session',function(request,response){
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

                        if(user){
                            data.repositories=user.repositories;
                        }else{
                            data.repositories=[];
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

    app.get('/dbserver/_all_dbs',authed,function(request,response){
        var _repositories=request.user.repositories.map(function(repository){
            return repository.name;
        });
        response.status(200).json(_repositories);
    });

    app.put('/dbserver/:repository',authed,function(request,response){
        var auth=cookie(request.headers.cookie)
          , repository=request.params.repository

        if(!request.user.repositories.some(function(_repository){
            return _repository.name==repository;
        })){
            redis.hkeys('monitor:dbservers',function(err,dbservers){
                if(err){
                    console.log(err);
                }
                if(dbservers){
                    var dbserverid=dbservers[
                            Math.floor(Math.random()*dbservers.length)]

                    dbauth(dbserverid,function(dbserver){
                        if(dbserver){
                            var name=dbserver.db.prefix+request.user.id
                                    +'_'+repository

                            _request.put({
                                url:dbserver.db.host+':'+dbserver.db.port
                                    +'/'+name
                              , headers:{
                                    'Cookie':dbserver.auth.cookie
                                  , 'X-CouchDB-WWW-Authenticate':'Cookie'
                                }
                            },function(error,reply){
                                if(reply.statusCode==201){
                                    var _repository=JSON.stringify({
                                            dbserver:dbserverid
                                          , dbinfo:{
                                                db_name:name
                                              , doc_count:0
                                              , doc_del_count:0
                                              , update_seq:0
                                              , purge_seq:0
                                              , compact_running:false
                                              , disk_size:79
                                              , data_size:0
                                              , instance_start_time:
                                                    Date.now()*1000
                                              , disk_format_version:6
                                              , committed_update_seq:0
                                            }
                                        })

                                    request.user.repositories.push({
                                        name:repository
                                      , dbserver:dbserverid
                                    });

                                    User.findOneAndUpdate({
                                        id:request.user.id
                                    },request.user,{upsert:true},
                                        function(err,user){
                                        redis.hset('monitor:repositories',
                                            name,_repository,function(err){
                                            if(err){
                                                console.log(err);
                                            }
                                            redis.setex('user:'+auth,60*5,
                                                JSON.stringify(request.user),
                                                function(err){
                                                    if(err){
                                                        console.log(err);
                                                    }
                                                response
                                                    .status(reply.statusCode)
                                                    .json(reply.body);
                                            });
                                        });
                                    });
                                }else{
                                    response.status(reply.statusCode)
                                        .json(reply.body);
                                }
                            });
                        }else{
                            response.status(401).json(_error.auth);
                        }
                    });
                }else{
                    response.status(401).json(_error.auth);
                }
            });
        }else{
            response.status(412).json({
                error:'file_exists'
              , reason:'The database could not be created, '
                    +'the file already exists.'
            });
        }
    });

    app.delete('/dbserver/:repository',authed,function(request,response){
        var auth=cookie(request.headers.cookie)
          , repository=request.params.repository
          , index=request.user.repositories.findIndex(function(_repository){
                return _repository.name==repository;
            })

        if(index>=0){
            dbauth(request.user.repositories[index].dbserver,function(dbserver){
                if(dbserver){
                    var name=dbserver.db.prefix+request.user.id
                            +'_'+repository

                    _request.del({
                        url:dbserver.db.host+':'+dbserver.db.port
                            +'/'+name
                      , headers:{
                            'Cookie':dbserver.auth.cookie
                          , 'X-CouchDB-WWW-Authenticate':'Cookie'
                        }
                    },function(error,reply){
                        if(reply.statusCode==200){
                            redis.hdel('monitor:repositories',name,
                                function(err){
                                if(err){
                                    console.log(err);
                                }

                                request.user.repositories.splice(index,1);

                                redis.setex('user:'+auth,60*5,
                                    JSON.stringify(request.user),
                                    function(err){
                                    if(err){
                                        console.log(err);
                                    }
                                    User.findOneAndUpdate({
                                        id:request.user.id
                                    },request.user,{upsert:true},
                                        function(err,user){
                                        if(err){
                                            console.log(err);
                                        }
                                        response.status(reply.statusCode)
                                            .json(reply.body);
                                    });
                                });
                            });
                        }else{
                            response.status(reply.statusCode)
                                .json(reply.body);
                        }
                    });
                }else{
                    response.status(404).json({
                        ok:false
                    });
                }
            });
        }else{
            response.status(404).json({
                ok:false
            });
        }
    });

    var generic1=function(request,response,method){
        var repository=request.params.repository
          , Repository=request.user.repositories.find(function(_repository){
                return _repository.name==repository;
            })

        if(Repository){
            dbauth(Repository.dbserver,function(dbserver){
                if(dbserver){
                    var name=dbserver.db.prefix+request.user.id+'_'+repository
                      , params=request.url.split('/')

                    params[0]=dbserver.db.host+':'+dbserver.db.port;
                    params[2]=name;
                    params.splice(1,1);

                    var packet={
                            url:params.join('/')
                          , headers:{
                                'Cookie':dbserver.auth.cookie
                              , 'X-CouchDB-WWW-Authenticate':'Cookie'
                            }
                        }
                    if(method!='head'){
                        packet.json=request.body;
                    }

                    _request[method](packet,function(error,reply){
                        response.status(reply.statusCode);
                        if(method!='head'){
                            response.json(reply.body);
                        }else{
                            response.send();
                        }
                    });
                }else{
                    response.status(404);
                    if(method!='head'){
                        response.json({
                            ok:false
                        });
                    }else{
                        response.send();
                    }
                }
            });
        }else{
            response.status(404);
            if(method!='head'){
                response.json({
                    ok:false
                });
            }else{
                response.send();
            }
        }
    };

    app.put('/dbserver/:repository/:document',authed,
    function(request,response){
        return generic1(request,response,'put');
    });

    app.get('/dbserver/:repository/:document',authed,
    function(request,response){
        return generic1(request,response,'get');
    });

    app.head('/dbserver/:repository/_design/:document',authed,
    function(request,response){
        return generic1(request,response,'head');
    });

    app.put('/dbserver/:repository/_design/:document',authed,
    function(request,response){
        return generic1(request,response,'put');
    });

    app.get('/dbserver/:repository/_design/:view/_view/:funct',authed,
    function(request,response){
        return generic1(request,response,'get');
    });
};

