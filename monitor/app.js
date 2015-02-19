'use strict';

var http=require('http')
  , express=require('express')
  , bodyparser=require('body-parser')
  , app=express()
  , server=http.Server(app)
  , morgan=require('morgan')
  , request=require('request')
  , redis=require('redis')
  , redisclient=redis.createClient()
  , validate=require('../planners/utils/validators')
  , _success=require('../planners/utils/json-response').success
  , _error=require('../planners/utils/json-response').error
  , assign=function(planner,done){
        redisclient.lpop('monitor:queue',function(err,task){
            if(task){
                notify(task,planner,function(){
                    redisclient.hset('monitor:tasks',task,planner,function(){
                        done();
                    });
                },function(){
                    redisclient.rpush('monitor:queue',task,function(){
                        assign(planner,done);
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
        request.post({
            url:task
          , json:{planner:planner}
        },function(error,response){
            if(!error&&response.statusCode==200){
                success();
            }else{
                fail();
            }
        });
    }

app.set('port',process.env.PORT||3004);
app.disable('x-powered-by');
app.use(bodyparser.json());
app.use(morgan('dev'));

app.get('/id',function(request,response){
    response.status(200).json({
        monitor:'ready for action'
    });
});

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
            redisclient.rpush('monitor:queue',task,function(err,reply){
                if(reply==1){
                    assign(planner,function(){
                        response.status(200).json(_success.ok);
                    });
                }else{
                    response.status(403).json(_error.json);
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
                response.status(200).json(_success.ok);
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

server.listen(app.get('port'),'localhost',function(){
    console.log('pleni ✯ planners monitor: listening on port '
        +app.get('port')+'\n');
});

module.exports=app;

