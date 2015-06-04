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

module.exports=function(app){
    var authed=app.get('auth');

    app.get('/resources/dbservers',authed,function(request,response){
        DBServer.find({},function(err,dbservers){
            return response.status(200).json(dbservers.map(function(dbserver){
                return {
                    id:dbserver.id
                  , db:{
                        host:dbserver.db.host
                      , port:dbserver.db.port
                      , prefix:dbserver.db.prefix
                    }
                };
            }));
        });
    });

    app.put('/resources/dbservers',authed,function(request,response){
        if(schema.js.validate(request.body,schema.dbservers).length==0){
            DBServer.remove({},function(){
                DBServer.collection.insert(
                    request.body.map(function(dbserver){
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
                    }),function(){
                        response.status(201).json(_success.ok);
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
                    DBServer.create({
                        id:validate.toString(request.body.id)
                      , db:{
                            host:validate.toValidHost(request.body.db.host)
                          , port:validate.toInt(request.body.db.port)
                          , user:validate.toString(request.body.db.user)
                          , pass:validate.toString(request.body.db.pass)
                          , prefix:validate.toString(request.body.db.prefix)
                        }
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
                            response.status(403).json(_error.validation);
                        }
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
        DBServer.remove({},function(){
            response.status(200).json(_success.ok);
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
        DBServer.findOne({
            id:validate.toString(request.params.dbserver)
        },function(err,dbserver){
            if(dbserver){
                response.status(200).json({
                    id:dbserver.id
                  , db:{
                        host:dbserver.db.host
                      , port:dbserver.db.port
                      , prefix:dbserver.db.prefix
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
              , host=validate.toValidHost(request.body.db.host)
              , port=validate.toInt(request.body.db.port)
              , user=validate.toString(request.body.db.user)
              , pass=validate.toString(request.body.db.pass)
              , prefix=validate.toString(request.body.db.prefix)

            DBServer.findOne({id:id},function(err,dbserver){
                if(dbserver){
                    dbserver.db={
                        host:host
                      , port:port
                      , user:user
                      , pass:pass
                      , prefix:prefix
                    };

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
                      , db:{
                            host:host
                          , port:port
                          , user:user
                          , pass:pass
                          , prefix:prefix
                        }
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
                dbserver.remove(function(){
                    response.status(200).json(_success.ok);
                });
            }else{
                response.status(404).json(_error.notfound);
            }
        });
    });

    app.post('/resources/dbservers/:dbserver/_check',authed,
        function(request,response){
        DBServer.findOne({
            id:validate.toString(request.params.dbserver)
        },function(err,dbserver){
            if(dbserver){
                test({
                    db:{
                        host:dbserver.db.host+':'+
                             dbserver.db.port
                      , user:dbserver.db.user
                      , pass:dbserver.db.pass
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

