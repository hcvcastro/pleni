'use strict';

var App=require('./models/app')
  , DBServer=require('./models/dbserver')
  , Planner=require('./models/planner')
  , User=require('./models/user')
  , Q=require('q')
  , db_test=require('../../core/functions/databases/test')
  , db_auth=require('../../core/functions/databases/auth')
  , db_list=require('../../core/functions/databases/list')
  , db_infodbs=require('../../core/functions/databases/infodbs')
  , planner_test=require('../../core/functions/planners/test')
  , planner_api=require('../../core/functions/planners/api')
  , planner_get=require('../../core/functions/planners/get')

module.exports=function(app,config){
    var redis=app.get('redis')

    App.find({},function(err,apps){
        var params={}

        apps.forEach(function(app){
            params[app.key]=app.id;
        });

        if(apps.length>0){
            redis.hmset('monitor:apps',params,function(err,reply){
                if(err){
                    console.log(err);
                }
            });
        }
    });

    DBServer.find({},function(err,dbservers){
        var params1={}

        dbservers.forEach(function(dbserver){
            params1[dbserver.id]=JSON.stringify({
                db:dbserver.db
            });
        });

        Q.all(dbservers.map(function(dbserver){
            return db_test({
                id:dbserver.id
              , db:{
                    host:dbserver.db.host+':'+dbserver.db.port
                  , user:dbserver.db.user
                  , pass:dbserver.db.pass
                  , prefix:dbserver.db.prefix
                }
            })
            .then(db_auth)
            .then(db_list)
            .then(db_infodbs)
            .fail(function(error){})
        }))
        .spread(function(){
            var params2={}

            for(var arg in arguments){
                if(arguments[arg]){
                    var id=arguments[arg].id

                    arguments[arg].db.explist.forEach(function(repository){
                        params2[repository.db_name]=JSON.stringify({
                            dbserver:id
                          , dbinfo:repository
                        });
                    });

                    if(arguments[arg].auth){
                        var json=JSON.parse(params1[id])

                        json.auth=arguments[arg].auth;
                        params1[id]=JSON.stringify(json);
                    }
                }
            }

            if(Object.keys(params1).length){
                redis.hmset('monitor:dbservers',params1);
                if(Object.keys(params2).length){
                    redis.hmset('monitor:repositories',params2);
                }
            }
        });
    });

    Planner.find({},function(err,planners){
        var params1={}

        planners.forEach(function(planner){
            params1[planner.id]=JSON.stringify({
                planner:planner.planner
            });
        });

        Q.all(planners.map(function(planner){
            var packet={
                    id:planner.id
                  , planner:{
                        host:planner.planner.host+':'+planner.planner.port
                    }
                }

            if(planner.planner.tid){
                packet.planner.tid=planner.planner.tid;
            }

            return planner_test(packet)
                .then(planner_api)
                .fail(function(error){});
        }))
        .spread(function(){
            var params2={}

            for(var arg in arguments){
                if(arguments[arg]){
                    var id=arguments[arg].id

                    arguments[arg].planner.tasks.forEach(function(task){
                        if(!params2[task.name]){
                            params2[task.name]={
                                schema:task.schema
                              , planners:[]
                            };
                        }

                        params2[task.name].planners.push(id);
                    });
                }
            }

            for(var arg in params2){
                params2[arg]=JSON.stringify(params2[arg]);
            }

            if(Object.keys(params1).length){
                redis.hmset('monitor:planners',params1);
                if(Object.keys(params2).length){
                    redis.hmset('monitor:apis',params2);
                }
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
