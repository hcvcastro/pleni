'use strict';

var extend=require('underscore').extend
  , validate=require('../../../core/validators')
  , _success=require('../../../core/json-response').success
  , _error=require('../../../core/json-response').error
  , schema=require('../../../core/schema')
  , Planner=require('../models/planner')
  , sort=require('../../../core/utils').sort
  , test=require('../../../core/functions/planners/test')
  , status=require('../../../core/functions/planners/status')
  , api=require('../../../core/functions/planners/api')
  , set=require('../../../core/functions/planners/set')
  , get=require('../../../core/functions/planners/get')
  , unset=require('../../../core/functions/planners/unset')

module.exports=function(app,socket_connect,socket_disconnect,socket_clean){
    var authed=app.get('auth')
      , redis=app.get('redis')
      , api_add=function(id,planner){
            test({
                planner:{
                    host:planner.host+':'+planner.port
                }
            })
            .then(api)
            .then(function(args){
                redis.hgetall('monitor:apis',function(err,reply){
                    if(err){
                        console.log(err);
                    }

                    if(!reply){
                        reply={};
                    }

                    args.planner.tasks.forEach(function(task){
                        if(task.name in reply){
                            var json=JSON.parse(reply[task.name])

                            json.planners.push(id);
                            reply[task.name]=JSON.stringify(json);
                        }else{
                            reply[task.name]=JSON.stringify({
                                schema:task.schema
                              , planners:[id]
                            });
                        }
                    });

                    redis.hmset('monitor:apis',reply);
                });
            });
        }
      , api_remove=function(id,done){
            redis.hgetall('monitor:apis',function(err,reply){
                if(err){
                    console.log(err);
                }

                for(var r in reply){
                    var json=JSON.parse(reply[r])
                      , index=json.planners.findIndex(function(_planner){
                            return _planner==id;
                        })

                    if(index>=0){
                        json.planners.splice(index,1);
                    }

                    if(json.planners.length==0){
                        delete reply[r];
                    }else{
                        reply[r]=JSON.stringify(json);
                    }
                }

                if(Object.keys(reply).length!=0){
                    redis.hmset('monitor:apis',reply,function(err){
                        if(err){
                            console.log(err);
                        }

                        if(done){
                            done();
                        }
                    });
                }else{
                    redis.del('monitor:apis',function(err){
                        if(err){
                            console.log(err);
                        }

                        if(done){
                            done();
                        }
                    });
                }
            });
        }

    app.get('/resources/planners',authed,function(request,response){
        redis.hgetall('monitor:planners',function(err,reply){
            var list=[]
            
            for(var r in reply){
                var planner=JSON.parse(reply[r])

                list.push({
                    id:r
                  , planner:{
                        host:planner.planner.host
                      , port:planner.planner.port
                    }
                });
            }

            list.sort(sort);
            return response.status(200).json(list);
        });
    });

    app.put('/resources/planners',authed,function(request,response){
        if(schema.js.validate(request.body,schema.planners).length==0){
            socket_clean();
            redis.del('monitor:free');
            redis.del('monitor:apis');

            Planner.remove({},function(){
                var obj1=request.body.map(function(planner){
                        return {
                            id:validate.toString(planner.id)
                          , planner:{
                                host:validate.toValidHost(planner.planner.host)
                              , port:validate.toInt(planner.planner.port)
                            }
                        };
                    })
                  , obj2={}

                obj1.forEach(function(el){
                    obj2[el.id]=JSON.stringify({
                        planner:el.planner
                      , status:'stopped'
                    });

                    socket_connect(el.id,el.planner.host,el.planner.port);
                });

                Planner.collection.insert(obj1,function(){
                    redis.del('monitor:planners',function(err,reply){
                        if(err){
                            console.log(err);
                        }
                        redis.hmset('monitor:planners',obj2,
                        function(err,reply){
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

    app.post('/resources/planners',authed,function(request,response){
        if(schema.js.validate(request.body,schema.planner).length==0){
            Planner.findOne({id:request.body.id},function(err,planner){
                if(!planner){
                    var id=validate.toString(request.body.id)
                      , planner={
                            host:validate.toValidHost(request.body.planner.host)
                          , port:validate.toInt(request.body.planner.port)
                        }

                    socket_connect(id,planner.host,planner.port);

                    redis.hset('monitor:planners',id,JSON.stringify({
                        planner:planner
                      , status:'stopped'
                    }),function(err,reply){
                        if(err){
                            console.log(err);
                        }

                        Planner.create({
                            id:id
                          , planner:planner
                        });

                        response.status(201).json({
                            id:id
                          , planner:{
                                host:planner.host
                              , port:planner.port
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

    app.delete('/resources/planners',authed,function(request,response){
        redis.del('monitor:planners',function(err,reply){
            if(err){
                console.log(err);
            }

            socket_clean();
            redis.del('monitor:free');
            redis.del('monitor:api');

            Planner.remove({},function(){
                response.status(200).json(_success.ok);
            });
        });
    });

    app.post('/resources/planners/_check',authed,function(request,response){
        if(schema.js.validate(request.body,schema.planner).length==0){
            test({
                planner:{
                    host:validate.toValidHost(request.body.planner.host)+':'+
                         validate.toInt(request.body.planner.port)
                }
            })
            .then(function(args){
                response.status(200).json(_success.ok);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(401).json(_error.auth);
                }else if(error.error=='response_malformed'){
                    response.status(400).json(_error.json);
                }else{
                    response.status(404).json(_error.network);
                }
            })
            .done();
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.get('/resources/planners/:planner',authed,function(request,response){
        var id=validate.toString(request.params.planner)

        redis.hget('monitor:planners',id,function(err,reply){
            var planner=JSON.parse(reply)

            if(planner){
                response.status(200).json({
                    id:id
                  , planner:{
                        host:planner.planner.host
                      , port:planner.planner.port
                    }
                });
            }else{
                response.status(404).json(_error.notfound);
            }
        });
    });

    app.put('/resources/planners/:planner',authed,function(request,response){
        if(schema.js.validate(request.body,schema.planner).length==0){
            var id=validate.toString(request.params.planner)
              , planner={
                    host:validate.toValidHost(request.body.planner.host)
                  , port:validate.toInt(request.body.planner.port)
                }

            Planner.findOne({id:id},function(err,_planner){
                redis.hset('monitor:planners',id,JSON.stringify({
                    planner:planner
                  , status:'stopped'
                }));

                if(_planner){
                    _planner.planner=planner;

                    socket_disconnect(_planner.id);
                    socket_connect(_planner.id,planner.host,planner.port);

                    _planner.save(function(err,_planner){
                        if(err){
                            console.log(err);
                        }

                        response.status(200).json({
                            id:_planner.id
                          , planner:{
                                host:_planner.planner.host
                              , port:_planner.planner.port
                            }
                        });
                    });
                }else{
                    socket_connect(id,planner.host,planner.port);

                    Planner.create({
                        id:id
                      , planner:planner
                    },function(err,_planner){
                        if(err){
                            console.log(err);
                        }

                        response.status(201).json({
                            id:_planner.id
                          , planner:{
                                host:_planner.planner.host
                              , port:_planner.planner.port
                            }
                        });
                    });
                }
            });
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/resources/planners/:planner',authed,function(request,response){
        Planner.findOne({
            id:validate.toString(request.params.planner)
        },function(err,planner){
            if(planner){
                socket_disconnect(planner.id);

                redis.srem('monitor:free',planner.id);
                api_remove(id);

                redis.hdel('monitor:planners',planner.id,function(err,reply){
                    if(err){
                        console.log(err);
                    }
                    response.status(200).json(_success.ok);
                    planner.remove();
                });
            }else{
                response.status(404).json(_error.notfound);
            }
        });
    });

    var generic_action=function(request,response,json,sequence,next){
        var id=validate.toString(request.params.planner)
          , body=request.body

        delete body.server;
        if(json){
            if(schema.js.validate(body,json).length!=0){
                response.status(403).json(_error.validation);
                return;
            }
        }

        redis.hget('monitor:planners',id,function(err,reply){
            if(err){
                console.log(err);
            }

            var planner=JSON.parse(reply)

            if(planner){
                var args={
                    id:id
                  , planner:{
                        host:planner.planner.host+':'+
                             planner.planner.port
                    }
                };
                if(planner.planner.tid){
                    args.planner.tid=planner.planner.tid;
                }
                if(json){
                    args=extend(body,args);
                }

                sequence.reduce(function(previous,current){
                    return previous.then(current);
                },test(args))
                .then(function(args){
                    next(planner,args);
                })
                .fail(function(error){
                    if(error.code=='ECONNREFUSED'){
                        response.status(404).json(_error.network);
                    }else if(error.error=='unauthorized'){
                        response.status(401).json(_error.auth);
                    }else if(error.error=='response_malformed'){
                        response.status(400).json(_error.json);
                    }else if(error.error=='not tid provided'){
                        response.status(401).json(_error.auth);
                    }else if(error.error=='not override'){
                        response.status(403).json(_error.notoverride);
                    }else if(error.error=='not found'){
                        response.status(404).json(_error.notfound);
                    }else{
                        console.log('error',error);
                        response.status(403).json(_error.badrequest);
                    }
                })
                .done();
            }else{
                response.status(404).json(_error.notfound)
            }
        });
    };

    app.post('/resources/planners/:planner/_check',authed,
        function(request,response){
        return generic_action(request,response,null,[],
            function(planner,args){
                response.status(200).json({
                    planner:{
                        host:args.planner.host
                      , type:args.planner.type
                    }
                });
        });
    });

    app.post('/resources/planners/:planner/_status',authed,
        function(request,response){
        return generic_action(request,response,null,[status],
            function(planner,args){
                response.status(200).json({
                    planner:{
                        host:args.planner.host
                      , status:args.planner.status
                    }
                });
        });
    });

    app.post('/resources/planners/:planner/_set',authed,
        function(request,response){
        return generic_action(request,response,schema.task,[set],
            function(planner,args){
                Planner.findOne({id:args.id},function(err,_planner){
                    if(err){
                        console.log(err);
                    }

                    _planner.planner.tid=args.planner.tid;
                    _planner.save();

                    redis.hget('monitor:planners',_planner.id,
                        function(err,reply){
                        if(err){
                            console.log(err);
                        }

                        var __planner=JSON.parse(reply)
                        __planner.planner.tid=args.planner.tid;
                        
                        redis.hset('monitor:planners',_planner.id,
                            JSON.stringify(__planner));

                        redis.sadd('monitor:free',_planner.id);
                        api_add(_planner.id,_planner.planner);

                        response.status(200).json({
                            planner:{
                                host:args.planner.host
                              , result:true
                            }
                        });
                    });
                });
        });
    });

    app.post('/resources/planners/:planner/_get',authed,
        function(request,response){
        return generic_action(request,response,null,[get],
            function(planner,args){
                response.status(200).json({
                    planner:{
                        host:args.planner.host
                      , task:{
                            name:args.planner.task.name
                          , count:args.planner.task.count
                          , interval:args.planner.task.interval
                        }
                    }
                });
        });
    });

    app.post('/resources/planners/:planner/_isset',authed,
        function(request,response){
        return generic_action(request,response,null,[],
            function(planner,args){
                response.status(200).json({
                    planner:{
                        host:args.planner.host
                      , result:'tid' in args.planner
                    }
                });
        });
    });

    app.post('/resources/planners/:planner/_unset',authed,
        function(request,response){
        return generic_action(request,response,null,[unset],
            function(planner,args){
                Planner.findOne({id:args.id},function(err,_planner){
                    if(err){
                        console.log(err);
                    }

                    _planner.planner.tid=undefined;
                    _planner.save();

                    redis.hget('monitor:planners',_planner.id,
                        function(err,reply){
                        if(err){
                            console.log(err);
                        }

                        var __planner=JSON.parse(reply)
                        __planner.planner.tid=undefined;

                        redis.hset('monitor:planners',_planner.id,
                            JSON.stringify(__planner));
                        });

                        redis.srem('monitor:free',_planner.id);
                        api_remove(_planner.id);
                });

                response.status(200).json({
                    planner:{
                        host:args.planner.host
                      , result:true
                    }
                });
        });
    });

    app.post('/resources/planners/:planner/_clean',authed,
        function(request,response){
        return generic_action(request,response,null,[],
            function(planner,args){
                Planner.findOne({id:args.id},function(err,_planner){
                    if(err){
                        console.log(err);
                    }

                    _planner.planner.tid=undefined;
                    _planner.save();

                    redis.hget('monitor:planners',_planner.id,
                        function(err,reply){
                        if(err){
                            console.log(err);
                        }

                        var __planner=JSON.parse(reply)
                        __planner.planner.tid=undefined;

                        redis.hset('monitor:planners',_planner.id,
                            JSON.stringify(__planner));
                        });
                });

                response.status(200).json({
                    planner:{
                        host:args.planner.host
                      , result:true
                    }
                });
        });
    });
};

