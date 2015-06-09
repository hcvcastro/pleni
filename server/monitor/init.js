'use strict';

var Client=require('./models/client')
  , DBServer=require('./models/dbserver')
  , Planner=require('./models/planner')
  , User=require('./models/user')
  , Q=require('q')
  , test=require('../../core/functions/databases/test')
  , auth=require('../../core/functions/databases/auth')
  , list=require('../../core/functions/databases/list')
  , infodbs=require('../../core/functions/databases/infodbs')

module.exports=function(app,config){
    var redis=app.get('redis')
      , load=function(model,container,each,done){
            model.find({},function(err,collection){
                var params={}
                
                collection.forEach(function(element){
                    each(params,element);
                });

                if(collection.length>0){
                    redis.hmset(container,params,function(err,reply){
                        if(err){
                            console.log(err);
                        }else if(done){
                            done(collection);
                        }
                    });
                }
            });
        }

    load(Client,'monitor:clients',function(params,element){
        params[element.key]=element.id;
    });
    load(DBServer,'monitor:dbservers',function(params,element){
        params[element.id]=JSON.stringify(element.db);
    },function(collection){
        Q.all(collection.map(function(dbserver){
            return test({
                id:dbserver.id
              , db:{
                    host:dbserver.db.host+':'+dbserver.db.port
                  , user:dbserver.db.user
                  , pass:dbserver.db.pass
                  , prefix:dbserver.db.prefix
                }})
                .then(auth)
                .then(list)
                .then(infodbs);
        }))
        .spread(function(){
            var params1={}
              , params2={}
              , params3={}

            for(var arg in arguments){
                var id=arguments[arg].id
                arguments[arg].db.explist.forEach(function(repository){
                    params1[repository.db_name]=id;
                    params2[repository.db_name]=JSON.stringify(repository);
                });
                params3[id]=JSON.stringify(arguments[arg].auth);
            }

            redis.hmset('monitor:repositorydb',params1,function(err,reply){
                if(err){
                    console.log(err);
                }
            });
            redis.hmset('monitor:repositories',params2,function(err,reply){
                if(err){
                    console.log(err);
                }
            });
            redis.hmset('monitor:cookies',params3,function(err,reply){
                if(err){
                    console.log(err);
                }
            });
        })
        .done();
    });
    load(Planner,'monitor:planners',function(params,element){
        params[element.id]=JSON.stringify(element.planner);
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

