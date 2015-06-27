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

module.exports=function(app){
    var authed=app.get('auth')
      , redis=app.get('redis')

    app.get('/resources/planners',authed,function(request,response){
        redis.hgetall('monitor:planners',function(err,reply){
            var list=[]
            
            for(var r in reply){
                var planner=JSON.parse(reply[r]);

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
                    obj2[el.id]=JSON.stringify({planner:el.planner});
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

                    redis.hset('monitor:planners',id,JSON.stringify({
                        planner:planner}),
                        function(err,reply){
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
                    planner:planner}));

                if(_planner){
                    _planner.planner=planner;

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
                    planner:{
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

    app.post('/resources/planners/:planner/_set',authed,
        function(request,response){
        return generic_action(request,response,schema.task,[set],
            function(planner,args){
                console.log('args',args);
                Planner.findOne({id:args.planner.id},function(err,_planner){
                    if(err){
                        console.log(err);
                    }

                    _planner.planner.tid=args.planner.tid;
                    _planner.save();

                    redis.hset('monitor:planners',id,JSON.stringify(_planner));
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

