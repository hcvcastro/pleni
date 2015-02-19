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
  , send_free=function(task,planner,success,fail){
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

app.put('/planners',function(request,response){
    if(validate.validHost(request.body.planner)){
        var planner=validate.toValidHost(request.body.planner)

        redisclient.sadd('monitor:planners',planner);
        redisclient.sadd('monitor:free',planner);

        response.status(200).json(_success.ok);
    }else{
        response.status(403).json(_error.json);
    }
});

app.delete('/planners',function(request,response){
    if(validate.validHost(request.body.planner)){
        var planner=validate.toValidHost(request.body.planner)

        if(redisclient.sismember('monitor:free',planner)){
            redisclient.srem('monitor:planners',planner);
            redisclient.srem('monitor:free',planner);

            response.status(200).json(_success.ok);
        }else{
            response.status(403).json({ok:false,msg:'the planner is in use'});
        }
    }else{
        response.status(403).json(_error.json);
    }
});

app.put('/tasks',function(request,response){
    if(validate.validHost(request.body.task)){
        var task=request.body.task;

        redisclient.spop('monitor:free',function(err,reply){
            if(!err&&reply){
                send_free(task,reply,function(){
                    redisclient.hset('monitor:tasks',task,reply);
                },function(){
                    redisclient.sadd('monitor:free',reply);
                });
            }else{
                redisclient.rpush('monitor:queue',task);
            }
        });

        response.status(200).json(_success.ok);
    }else{
        response.status(403).json(_error.json);
    }
});

app.delete('/tasks',function(request,response){
    if(validate.validHost(request.body.response)){
        var task=request.body.task
          , planner=redisclient.hget('monitor:tasks',task)

        if(planner){
            redisclient.hdel('monitor:tasks',task);

            var new_task=redisclient.lpop('monitor:queue')
              , assigned=false

            while(!assigned){
                if(new_task){
                    send_free(new_task,planner,function(){
                        assigned=true;
                    },function(){
                        redisclient.rpush('monitor:queue',new_task);
                        new_task=redisclient.lpop('monitor:queue');
                    });
                }else{
                    assigned=true;
                    redisclient.sadd('monitor:free',planner);
                }
            }
        }
        response.status(200).json(_success.ok);
    }else{
        response.status(403).json(_error.json);
    }
});

server.listen(app.get('port'),'localhost',function(){
    console.log('pleni ✯ planners monitor: listening on port '
        +app.get('port')+'\n');
});

module.exports=app;

