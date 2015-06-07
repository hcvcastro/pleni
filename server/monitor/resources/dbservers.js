'use strict';

var validate=require('../../../core/validators')
  , _success=require('../../../core/json-response').success
  , _error=require('../../../core/json-response').error
  , schema=require('../../../core/schema')
  , DBServer=require('../models/dbserver')
  , test=require('../../../core/functions/databases/test')
  , auth=require('../../../core/functions/databases/auth')
  , list=require('../../../core/functions/databases/list')
  , infodbs=require('../../../core/functions/databases/infodbs')
  , sort=require('../../../core/utils').sort

module.exports=function(app){
    var authed=app.get('auth')
      , redis=app.get('redis')

    app.get('/resources/dbservers',authed,function(request,response){
        redis.hgetall('monitor:dbservers',function(err,reply){
            var list=[]

            for(var r in reply){
                var db=JSON.parse(reply[r]);

                list.push({
                    id:r
                  , db:{
                        host:db.host
                      , port:db.port
                      , prefix:db.prefix
                    }
                })
            }

            list.sort(sort);
            return response.status(200).json(list);
        });
    });

    app.put('/resources/dbservers',authed,function(request,response){
        if(schema.js.validate(request.body,schema.dbservers).length==0){
            DBServer.remove({},function(){
                var obj1=request.body.map(function(dbserver){
                        return {
                            id:validate.toString(dbserver.id)
                          , db:{
                                host:validate.toValidHost(dbserver.db.host)
                              , port:validate.toInt(dbserver.db.port)
                              , user:validate.toString(dbserver.db.user)
                              , pass:validate.toString(dbserver.db.pass)
                              , prefix:validate.toString(dbserver.db.prefix)
                            }
                        };
                    })
                  , obj2={}

                obj1.forEach(function(el){
                    obj2[el.id]=JSON.stringify(el.db);
                });

                DBServer.collection.insert(obj1,function(){
                    redis.del('monitor:dbservers',function(err,reply){
                        if(err){
                            console.log(err);
                        }
                        redis.hmset('monitor:dbserver',obj2,function(err,reply){
                            if(err){
                                console.log(err);
                            }
                            response.status(201).json(_success.ok);
                        })
                    });
                });
            });
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/resources/dbservers',authed,function(request,response){
        if(schema.js.validate(request.body,schema.dbserver).length==0){
            DBServer.findOne({id:request.body.id},function(err,dbserver){
                if(!dbserver){
                    var id=validate.toString(request.body.id)
                      , db={
                            host:validate.toValidHost(request.body.db.host)
                          , port:validate.toInt(request.body.db.port)
                          , user:validate.toString(request.body.db.user)
                          , pass:validate.toString(request.body.db.pass)
                          , prefix:validate.toString(request.body.db.prefix)
                        }

                    redis.hset('monitor:dbservers',id,JSON.stringify(db),
                        function(err,reply){
                        if(err){
                            console.log(err);
                        }

                        DBServer.create({
                            id:id
                          , db:db
                        });

                        response.status(201).json({
                            id:id
                          , db:{
                                host:db.host
                              , port:db.port
                              , prefix:db.prefix
                            }
                        });
                    });
                }else{
                    response.status(403).json(_error.notoverride);
                }
            });
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/resources/dbservers',authed,function(request,response){
        redis.del('monitor:dbservers',function(err,reply){
            if(err){
                console.log(err);
            }
            DBServer.remove({},function(){
                response.status(200).json(_success.ok);
            });
        });
    });

    app.post('/resources/dbservers/_check',authed,function(request,response){
        if(schema.js.validate(request.body,schema.dbserver).length==0){
            test({
                db:{
                    host:validate.toValidHost(request.body.db.host)+':'+
                         validate.toInt(request.body.db.port)
                  , user:validate.toString(request.body.db.user)
                  , pass:validate.toString(request.body.db.pass)
                }
            })
            .then(auth)
            .then(function(args){
                response.status(200).json(_success.ok);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(401).json(_error.auth);
                }
            })
            .done();
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.get('/resources/dbservers/:dbserver',authed,function(request,response){
        var id=validate.toString(request.params.dbserver)

        redis.hget('monitor:dbservers',id,function(err,reply){
            var db=JSON.parse(reply)

            if(db){
                response.status(200).json({
                    id:id
                  , db:{
                        host:db.host
                      , port:db.port
                      , prefix:db.prefix
                    }
                });
            }else{
                response.status(404).json(_error.notfound);
            }
        });
    });

    app.put('/resources/dbservers/:dbserver',authed,function(request,response){
        if(schema.js.validate(request.body,schema.dbserver).length==0){
            var id=validate.toString(request.params.dbserver)
              , db={
                    host:validate.toValidHost(request.body.db.host)
                  , port:validate.toInt(request.body.db.port)
                  , user:validate.toString(request.body.db.user)
                  , pass:validate.toString(request.body.db.pass)
                  , prefix:validate.toString(request.body.db.prefix)
                }

            DBServer.findOne({id:id},function(err,dbserver){
                redis.hset('monitor:clients',id,JSON.stringify(db));

                if(dbserver){
                    dbserver.db=db;

                    dbserver.save(function(err,dbserver){
                        if(!err){
                            response.status(200).json({
                                id:dbserver.id
                              , db:{
                                    host:dbserver.db.host
                                  , port:dbserver.db.port
                                  , prefix:dbserver.db.prefix
                                }
                            });
                        }else{
                            response.status(403).json(_error.json);
                        }
                    });
                }else{
                    DBServer.create({
                        id:id
                      , db:db
                    },function(err,dbserver){
                        if(!err){
                            response.status(201).json({
                                id:dbserver.id
                              , db:{
                                    host:dbserver.db.host
                                  , port:dbserver.db.port
                                  , prefix:dbserver.db.prefix
                                }
                            });
                        }else{
                            response.status(403).json(_error.json);
                        }
                    });
                }
            });
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/resources/dbservers/:dbserver',authed,
        function(request,response){
        DBServer.findOne({
            id:validate.toString(request.params.dbserver)
        },function(err,dbserver){
            if(dbserver){
                redis.hdel('monitor:dbservers',dbserver.id,function(err,reply){
                    if(err){
                        console.log(err);
                    }
                    response.status(200).json(_success.ok);
                    dbserver.remove();
                });
            }else{
                response.status(404).json(_error.notfound);
            }
        });
    });

    app.post('/resources/dbservers/:dbserver/_check',authed,
        function(request,response){
        var id=validate.toString(request.params.dbserver)

        redis.hget('monitor:dbservers',id,function(err,reply){
            var db=JSON.parse(reply)

            if(db){
                test({
                    db:{
                        host:db.host+':'+
                             db.port
                      , user:db.user
                      , pass:db.pass
                    }
                })
                .then(auth)
                .then(function(args){
                    response.status(200).json(_success.ok);
                })
                .fail(function(error){
                    if(error.code=='ECONNREFUSED'){
                        response.status(404).json(_error.network);
                    }else if(error.error=='unauthorized'){
                        response.status(401).json(_error.auth);
                    }
                })
                .done();
            }else{
                response.status(404).json(_error.notfound)
            }
        });
    });
};

