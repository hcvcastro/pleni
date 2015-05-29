'use strict';

var validate=require('../../core/validators')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , schema=require('../../core/schema')
  , Client=require('./models/client')

module.exports=function(app){
    var authed=app.get('auth');

    app.get('/resources/clients',authed,function(request,response){
        Client.find({},function(err,clients){
            return response.status(200).json(clients.map(function(client){
                return {
                    id:client.id
                  , key:client.key
                };
            }));
        });
    });

    app.put('/resources/clients',authed,function(request,response){
        if(schema.js.validate(request.body,schema.clients).length==0){
            Client.remove({},function(){
                Client.collection.insert(
                    request.body.map(function(client){
                        return {
                            id:validate.toString(client.id)
                          , key:validate.toString(client.key)
                        };
                    }),function(){
                        response.status(201).json(_success.ok);
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
                    Client.create({
                        id:validate.toString(request.body.id)
                      , key:validate.toString(request.body.key)
                    },function(err,client){
                        if(!err){
                            response.status(201).json({
                                id:client.id
                              , key:client.key
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

    app.delete('/resources/clients',authed,function(request,response){
        Client.remove({},function(){
            response.status(200).json(_success.ok);
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
              , key=validate.toString(request.body.key)

            Client.findOne({id:id},function(err,client){
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

    app.delete('/resources/clients/:key',authed,
        function(request,response){
        Client.findOne({
            id:validate.toString(request.params.key)
        },function(err,key){
            if(key){
                key.remove(function(){
                    response.status(200).json(_success.ok);
                });
            }else{
                response.status(404).json(_error.notfound);
            }
        });
    });
};

