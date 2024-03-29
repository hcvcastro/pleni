'use strict';

var _request=require('request')
  , validate=require('../../core/validators')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , schema=require('../../core/schema')
  , generator=require('../../core/functions/utils/random').sync
  , sort=require('../../core/utils').sort2

module.exports=function(app,session,save_session,
    assign_planner,stop_planner,notify){
    var redis=app.get('redis')
      , cookie=function(header){
            var regex1=/^AuthSession=([a-z0-9-]+).*$/
              , regex2=/^.+seed=([a-z0-9-]+)$/
              , exec1=regex1.exec(header)
              , exec2=regex2.exec(header)

            return [
                exec1?exec1[1]:null
              , exec2?exec2[1]:null
            ];
        }
      , authed=function(request,response,next){
            var _auth=cookie(request.headers.cookie)

            if(_auth[0]){
                redis.get('user:'+_auth[0],function(err,reply){
                    if(err){
                        console.log(err);
                    }
                    if(reply){
                        request.user=JSON.parse(reply);
                        request.seed=_auth[1];
                        return next();
                    }else{
                        response.status(401).json(_error.auth);
                    }
                });
            }else{
                response.status(401).json(_error.auth);
            }
        }

    app.get('/planner/id',function(request,response){
        response.status(200).json({
            planner:'ready for action'
          , type:'virtual'
        });
    });

    app.post('/planner/_session',session);

    app.get('/planner/_api',function(request,response){
        redis.hgetall('monitor:apis',function(err,reply){
            if(err){
                console.log(err);
            }

            var result=[]

            for(var i in reply){
                var json=JSON.parse(reply[i])

                result.push({
                    name:i
                  , schema:json.schema
                });
            }

            result.sort(sort);
            response.status(200).json(result);
        });
    });

    app.post('/planner',authed,function(request,response){
        var _auth=cookie(request.headers.cookie)[0]

        if(schema.js.validate(request.body,schema.task2).length==0){
            redis.hkeys('monitor:apis',function(err,valid_tasks){
                if(err){
                    console.log(err);
                }

                if(!valid_tasks.some(function(element){
                    return element===request.body.task||
                        request.body.task=='exclusive'})){
                    response.status(404).json(_error.notfound);
                    return;
                }

                var count=validate.toInt(request.body.count)
                  , interval=validate.toInt(request.body.interval)
                  , index=request.user.tasks.findIndex(function(_task){
                        return _task.seed==request.seed;
                    })

                if(isNaN(count)){
                    count=1
                }
                if(count<0){
                    count=-1;
                }

                if(isNaN(interval)||interval<0){
                    interval=1000
                }

                if(index>=0&&
                    request.user.tasks[index].tid!=request.body.tid){
                    response.status(403).json(_error.notoverride);
                    return;
                }

                if(index<0&&request.user.tasks.length>=
                    +request.user.settings.max_tasks){
                    response.status(403).json(_error.notquota);
                    return;
                }

                var tid=generator()

                request.user.tasks.push({
                    seed:request.seed
                  , tid:tid
                  , status:'stopped'
                  , name:request.body.task
                  , count:count
                  , interval:interval
                });

                notify(request.user.app,request.user.id,request.seed,{
                    action:'create'
                  , task:{
                        id:request.body.task
                      , count:count
                      , interval:interval
                    }
                });

                save_session(_auth,request.user,function(){
                    response.status(200).json({
                        ok:true,
                        tid:tid
                    });
                });
            });
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.get('/planner/_status',authed,function(request,response){
        var task=request.user.tasks.find(function(_task){
                return _task.seed==request.seed;
            })

        if(task){
            response.status(200).json({
                status:task.status
            });
        }else{
            response.status(200).json({
                status:'stopped'
            });
        }
    });

    app.get('/planner/:tid',authed,function(request,response){
        var task=request.user.tasks.find(function(_task){
                return _task.seed==request.seed&&_task.tid==request.params.tid;
            })

        if(task){
            response.status(200).json({
                task:task.name
              , count:task.count
              , interval:task.interval
            });
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    app.delete('/planner/:tid',authed,function(request,response){
        var _auth=cookie(request.headers.cookie)[0]
          , index=request.user.tasks.findIndex(function(_task){
                return _task.seed==request.seed&&_task.tid==request.params.tid;
            })

        if(index>=0){
            request.user.tasks.splice(index,1);

            notify(request.user.app,request.user.id,request.seed,{
                action:'remove'
              , task:{
                    name:request.body.task
                }
            });

            save_session(_auth,request.user,function(){
                response.status(200).json(_success.ok);
            });
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    app.post('/planner/:tid/_run',authed,function(request,response){
        var _auth=cookie(request.headers.cookie)[0]
          , index=request.user.tasks.findIndex(function(_task){
                return _task.seed==request.seed&_task.tid==request.params.tid;
            })

        if(index>=0){
            var status=assign_planner({
                name:request.user.tasks[index].name
              , count:request.user.tasks[index].count
              , interval:request.user.tasks[index].interval
            },request.body,request.user.app,request.user.id,request.seed);

            request.user.tasks[index].status=status;

            notify(request.user.app,request.user.id,request.seed,{
                action:'run'
            });

            save_session(_auth,request.user,function(){
                response.status(200).json({
                    status:status
                });
            });
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    app.post('/planner/:tid/_stop',authed,function(request,response){
        var _auth=cookie(request.headers.cookie)[0]
          , index=request.user.tasks.findIndex(function(_task){
                return _task.seed==request.seed&_task.tid==request.params.tid;
            })

        if(index>=0){
            stop_planner(request.user.app,request.user.id,request.seed);

            request.user.tasks[index].status='stopped';

            save_session(_auth,request.user,function(){
                response.status(200).json({
                    status:'stopped'
                });
            });
        }else{
            response.status(404).json(_error.notfound);
        }
    });
};

