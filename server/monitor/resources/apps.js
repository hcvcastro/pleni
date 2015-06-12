'use strict';

var validate=require('../../../core/validators')
  , _success=require('../../../core/json-response').success
  , _error=require('../../../core/json-response').error
  , schema=require('../../../core/schema')
  , App=require('../models/app')
  , generator=require('../../../core/functions/utils/random').sync
  , sort=require('../../../core/utils').sort

module.exports=function(app){
    var authed=app.get('auth')
      , redis=app.get('redis')

    app.get('/resources/apps',authed,function(request,response){
        redis.hgetall('monitor:apps',function(err,reply){
            var list=[]

            for(var r in reply){
                list.push({
                    id:reply[r]
                  , key:r
                });
            }
            
            list.sort(sort);
            return response.status(200).json(list);
        });
    });

    app.put('/resources/apps',authed,function(request,response){
        if(schema.js.validate(request.body,schema.apps).length==0){
            App.remove({},function(){
                var obj1=request.body.map(function(app){
                        return {
                            id:validate.toString(app.id)
                          , key:generator()
                        };
                    })
                  , obj2={}

                obj1.forEach(function(el){
                    obj2[el.key]=el.id;
                });

                App.collection.insert(obj1,function(){
                    redis.del('monitor:apps',function(err,reply){
                        if(err){
                            console.log(err);
                        }
                        redis.hmset('monitor:apps',obj2,function(err,reply){
                            if(err){
                                console.log(err);
                            }
                            response.status(201).json(_success.ok);
                        });
                    });
                });
            });
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/resources/apps',authed,function(request,response){
        if(schema.js.validate(request.body,schema.app).length==0){
            App.findOne({id:request.body.id},function(err,app){
                if(!app){
                    var id=validate.toString(request.body.id)
                      , key=generator()

                    redis.hset('monitor:apps',key,id,function(err,reply){
                        if(err){
                            console.log(err);
                        }

                        App.create({
                            id:id
                          , key:key
                        });

                        response.status(201).json({
                            id:id
                          , key:key
                        });
                    })
                }else{
                    response.status(403).json(_error.notoverride);
                }
            });
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/resources/apps',authed,function(request,response){
        redis.del('monitor:apps',function(err,reply){
            if(err){
                console.log(err);
            }
            App.remove({},function(){
                response.status(200).json(_success.ok);
            });
        });
    });

    app.get('/resources/apps/:app',authed,function(request,response){
        App.findOne({
            id:validate.toString(request.params.app)
        },function(err,app){
            if(app){
                response.status(200).json({
                    id:app.id
                  , key:app.key
                });
            }else{
                response.status(404).json(_error.notfound);
            }
        });
    });

    app.put('/resources/apps/:app',authed,function(request,response){
        if(schema.js.validate(request.body,schema.app).length==0){
            var id=validate.toString(request.params.app)
              , key=generator()

            App.findOne({id:id},function(err,app){
                redis.hset('monitor:apps',key,id);

                if(app){
                    app.key=key

                    app.save(function(err,app){
                        if(!err){
                            response.status(200).json({
                                id:app.id
                              , key:app.key
                            });
                        }else{
                            response.status(403).json(_error.json);
                        }
                    });
                }else{
                    App.create({
                        id:id
                      , key:key
                    },function(err,app){
                        if(!err){
                            response.status(201).json({
                                id:app.id
                              , key:app.key
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

    app.delete('/resources/apps/:app',authed,
        function(request,response){
        App.findOne({
            id:validate.toString(request.params.app)
        },function(err,app){
            if(app){
                redis.hdel('monitor:apps',app.key,function(err,reply){
                    if(err){
                        console.log(err);
                    }
                    response.status(200).json(_success.ok);
                    app.remove();
                });
            }else{
                response.status(404).json(_error.notfound);
            }
        });
    });
};

