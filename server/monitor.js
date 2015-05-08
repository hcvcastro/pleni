'use strict';

var http=require('http')
  , express=require('express')
  , bodyparser=require('body-parser')
  , app=express()
  , server=http.createServer(app)
  , morgan=require('morgan')
  , request=require('request')
  , validate=require('../core/validators')
  , _success=require('../core/json-response').success
  , _error=require('../core/json-response').error
  , config=require('../config/monitor')
  , redis=require('redis')
  , redisclient=redis.createClient(
        config.redis.port,config.redis.host,config.redis.options)
  , assign=function(planner,done){
        redisclient.zrange('monitor:queue',0,0,function(err,task){
            if(task.length!=0){
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
    }

app.set('host',config.monitor.host);
app.set('port',config.monitor.port);
app.disable('x-powered-by');
app.use(bodyparser.json());

if(config.env=='production'){
    app.use(morgan('combined'));
}else{
    app.use(morgan('dev'));
}

redisclient.del('monitor:planners');
redisclient.del('monitor:free');
redisclient.del('monitor:queue');
redisclient.del('monitor:tasks');

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
            redisclient.zadd('monitor:queue',Date.now(),task,
            function(err,reply){
                if(planner){
                    assign(planner,function(){
                        response.status(200).json({
                            msg:'Available planner founded'
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

server.listen(app.get('port'),app.get('host'),function(){
    console.log('pleni ✯ planners monitor: listening on '
        +app.get('host')+':'+app.get('port')+'\n');
});

module.exports=app;

