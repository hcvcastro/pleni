'use strict';

var validate=require('../../../core/validators')
  , _success=require('../../../core/json-response').success
  , _error=require('../../../core/json-response').error
  , schema=require('../../../core/schema')
  , Client=require('../models/client')
  , generator=require('../../../core/functions/utils/random').sync
  , sort=require('../../../core/utils').sort

module.exports=function(app){
    var authed=app.get('auth')
      , redis=app.get('redis')

    app.get('/resources/clients',authed,function(request,response){
        redis.hgetall('monitor:clients',function(err,reply){
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

    app.put('/resources/clients',authed,function(request,response){
        if(schema.js.validate(request.body,schema.clients).length==0){
            Client.remove({},function(){
                var obj1=request.body.map(function(client){
                        return {
                            id:validate.toString(client.id)
                          , key:generator()
                        };
                    })
                  , obj2={}

                obj1.forEach(function(el){
                    obj2[el.key]=el.id;
                });

                Client.collection.insert(obj1,function(){
                    redis.hmset('monitor:clients',obj2,function(err,reply){
                        if(err){
                            console.log(err);
                        }
                        response.status(201).json(_success.ok);
                    });
                });
            });
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/resources/clients',authed,function(request,response){
        if(schema.js.validate(request.body,schema.client).length==0){
            Client.findOne({id:request.body.id},function(err,client){
                if(!client){
                    var id=validate.toString(request.body.id)
                      , key=generator()

                    redis.hset('monitor:clients',key,id,function(err,reply){
                        if(err){
                            console.log(err);
                        }

                        Client.create({
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

    app.delete('/resources/clients',authed,function(request,response){
        redis.del('monitor:clients',function(err,reply){
            if(err){
                console.log(err);
            }
            Client.remove({},function(){
                response.status(200).json(_success.ok);
            });
        });
    });

    app.get('/resources/clients/:client',authed,function(request,response){
        Client.findOne({
            id:validate.toString(request.params.client)
        },function(err,client){
            if(client){
                response.status(200).json({
                    id:client.id
                  , key:client.key
                });
            }else{
                response.status(404).json(_error.notfound);
            }
        });
    });

    app.put('/resources/clients/:client',authed,function(request,response){
        if(schema.js.validate(request.body,schema.client).length==0){
            var id=validate.toString(request.params.client)
              , key=generator()

            Client.findOne({id:id},function(err,client){
                redis.hset('monitor:clients',key,id);

                if(client){
                    client.key=key

                    client.save(function(err,client){
                        if(!err){
                            response.status(200).json({
                                id:client.id
                              , key:client.key
                            });
                        }else{
                            response.status(403).json(_error.json);
                        }
                    });
                }else{
                    Client.create({
                        id:id
                      , key:key
                    },function(err,client){
                        if(!err){
                            response.status(201).json({
                                id:client.id
                              , key:client.key
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

    app.delete('/resources/clients/:client',authed,
        function(request,response){
        Client.findOne({
            id:validate.toString(request.params.client)
        },function(err,client){
            if(client){
                redis.hdel('monitor:clients',client.key,function(err,reply){
                    if(err){
                        console.log(err);
                    }
                    response.status(200).json(_success.ok);
                    client.remove();
                });
            }else{
                response.status(404).json(_error.notfound);
            }
        });
    });
};

