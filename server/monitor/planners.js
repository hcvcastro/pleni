'use strict';

var validate=require('../../core/validators')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , schema=require('../../core/schema')
  , Planner=require('./models/planner').RPlanner
  , test=require('../../core/functions/planners/test')
  , status=require('../../core/functions/planners/status')
  , api=require('../../core/functions/planners/api')
  , set=require('../../core/functions/planners/set')
  , get=require('../../core/functions/planners/get')
  , unset=require('../../core/functions/planners/unset')
  , run=require('../../core/functions/planners/run')
  , stop=require('../../core/functions/planners/stop')

module.exports=function(app){
    var authed=app.get('auth');

    app.get('/resources/planners',authed,function(request,response){
        Planner.find({},function(err,planners){
            return response.status(200).json(planners.map(function(planner){
                return {
                    id:planner.id
                  , planner:{
                        host:planner.planner.host
                      , port:planner.planner.port
                    }
                };
            }));
        });
    });

    app.put('/resources/planners',authed,function(request,response){
        if(schema.js.validate(request.body,schema.planners).length==0){
            Planner.remove({},function(){
                Planner.collection.insert(
                    request.body.map(function(planner){
                        return {
                            id:validate.toString(planner.id)
                          , planner:{
                                host:validate.toValidHost(planner.planner.host)
                              , port:validate.toInt(planner.planner.port)
                            }
                        };
                    }),function(){
                        response.status(201).json(_success.ok);
                    });
            })
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/resources/planners',authed,function(request,response){
        if(schema.js.validate(request.body,schema.planner).length==0){
            Planner.findOne({id:request.body.id},function(err,planner){
                if(!planner){
                    Planner.create({
                        id:validate.toString(request.body.id)
                      , planner:{
                            host:validate.toValidHost(request.body.planner.host)
                          , port:validate.toInt(request.body.planner.port)
                        }
                    },function(err,planner){
                        if(!err){
                            response.status(201).json({
                                id:planner.id
                              , planner:{
                                    host:planner.planner.host
                                  , port:planner.planner.port
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

    app.delete('/resources/planners',authed,function(request,response){
        Planner.remove({},function(){
            response.status(200).json(_success.ok);
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
                }
            })
            .done();
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.get('/resources/planners/:planner',authed,function(request,response){
        Planner.findOne({
            id:validate.toString(request.params.planner)
        },function(err,planner){
            if(planner){
                response.status(200).json({
                    id:planner.id
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
              , host=validate.toValidHost(request.body.planner.host)
              , port=validate.toInt(request.body.planner.port)

            Planner.findOne({id:id},function(err,planner){
                if(planner){
                    planner.planner={
                        host:host
                      , port:port
                    };

                    planner.save(function(err,planner){
                        if(!err){
                            response.status(200).json({
                                id:planner.id
                              , planner:{
                                    host:planner.host
                                  , port:planner.port
                                }
                            });
                        }else{
                            response.status(403).json(_error.json);
                        }
                    });
                }else{
                    Planner.create({
                        id:id
                      , planner:{
                            host:host
                          , port:port
                        }
                    },function(err,planner){
                        if(!err){
                            response.status(201).json({
                                id:planner.id
                              , planner:{
                                    host:planner.host
                                  , port:planner.port
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

    app.delete('/resources/planners/:planner',authed,function(request,response){
        Planner.findOne({
            id:validate.toString(request.params.planner)
        },function(err,planner){
            if(planner){
                planner.remove(function(){
                    response.status(200).json(_success.ok);
                });
            }else{
                response.status(404).json(_error.notfound);
            }
        });
    });
};

/*  , assign=function(planner,done){
        redisclient.zrange('monitor:queue',0,0,function(err,task){
            if(task.length!=0){
        Planner.findOne({
            id:validate.toString(request.params.planner)
        },function(err,planner){
                redisclient.zremrangebyrank('monitor:queue',0,0,function(){
                    notify(task[0],planner,function(){
                        redisclient.hset('monitor:tasks',task[0],planner,
                        function(){
                            done();
                        });
                    },function(){
                        var penalty=Math.floor(Math.random()*8);
                        redisclient.zadd('monitor:queue',Date.now()+penalty,
                        task[0],function(){
                            assign(planner,done);
                        });
                    });
                });
            }else{
                redisclient.sadd('monitor:free',planner,function(){
                    done();
                });
            }
        });
    }
  , notify=function(task,planner,success,fail){
        console.log('ASSIGN ',task,' -> ',planner);
        if(config.env=='test'){
            success();
        }else{
            request.post({
                url:task
              , json:{planner:planner}
            },function(error,response){
                if(!error){
                    if(response.statusCode==200){
                        console.log('SUCCESS');
                        success();
                    }else{
                        console.log('FAIL',response.statusCode);
                        fail();
                    }
                }else{
                    console.log(error);
                    fail();
                }
            });
        }
    }*/

/*
redisclient.del('monitor:planners');
redisclient.del('monitor:free');
redisclient.del('monitor:queue');
redisclient.del('monitor:tasks');

app.put('/planners',function(request,response){
    if(validate.validHost(request.body.planner)){
        var planner=validate.toValidHost(request.body.planner)

        redisclient.sismember('monitor:planners',planner,function(err,res){
            if(!res){
                redisclient.sadd('monitor:planners',planner,function(err,reply){
                    assign(planner,function(){
                        response.status(200).json(_success.ok);
                    });
                });
            }else{
                response.status(403).json(_error.notoverride);
            }
        });
    }else{
        response.status(403).json(_error.json);
    }
});

app.put('/tasks',function(request,response){
    if(validate.validHost(request.body.task)){
        var task=request.body.task;

        redisclient.spop('monitor:free',function(err,planner){
            redisclient.zadd('monitor:queue',Date.now(),task,
            function(err,reply){
                if(planner){
                    assign(planner,function(){
                        response.status(200).json({
                            msg:'Available planner found'
                          , queue:0
                        });
                    });
                }else{
                    redisclient.zcard('monitor:queue',function(err,reply){
                        response.status(200).json({
                            msg:'Waiting for an available planner'
                          , queue:reply
                        });
                    });
                }
            });
        });
    }else{
        response.status(403).json(_error.json);
    }
});

app.delete('/tasks',function(request,response){
    if(validate.validHost(request.body.task)){
        var task=request.body.task;
        redisclient.hget('monitor:tasks',task,function(err,planner){
            if(planner){
                redisclient.hdel('monitor:tasks',task,function(){
                    assign(planner,function(){
                        response.status(200).json(_success.ok);
                    });
                });
            }else{
                redisclient.zrem('monitor:queue',task,function(err,task){
                    response.status(200).json(_success.ok);
                });
            }
        })
    }else{
        response.status(403).json(_error.json);
    }
});

app.delete('/planners',function(request,response){
    if(validate.validHost(request.body.planner)){
        var planner=validate.toValidHost(request.body.planner)

        redisclient.sismember('monitor:free',planner,function(err,res){
            if(res){
                redisclient.srem('monitor:free',planner,function(){
                    redisclient.srem('monitor:planners',planner,function(){
                        response.status(200).json(_success.ok);
                    });
                });
            }else{
                response.status(403).json(_error.busy);
            }
        });
    }else{
        response.status(403).json(_error.json);
    }
});
*/

