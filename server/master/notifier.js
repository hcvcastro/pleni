'use strict';

var validate=require('../../core/validators')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , schema=require('../../core/schema')
  , ioc=require('socket.io-client')
  , sockets={}
  , get_element=function(needle,haystack){
        for(var i=0;i<haystack.length;i++){
            if(haystack[i].planner.host==needle.planner.host
                &&haystack[i].planner.port==needle.planner.port){
                return [i,haystack[i]];
            }
        }
        return;
    }
  , get_planner=function(user,host,port){
        var planners=user.resources.planners

        for(var i=0;i<planners.length;i++){
            if(planners[i].planner.host==host&&planners[i].planner.port==port){
                return planners[i].id;
            }
        }
        return;
    }
  , socket_connect=function(id,host,port,notifier,sid){
        var socket=ioc.connect(host+':'+port,{reconnect:true,'forceNew':true})
        socket.on('notifier',function(msg){
            notifier(sid,{
                action:'planner'
              , id:id
              , planner:msg
            });
        });
        return socket;
    }

module.exports=function(app,config,notifier){
    var authed=app.get('auth');

    app.get('/id',function(request,response){
        response.json({
            master:'ready for action'
          , notifier:'ready for action'
          , signature:'io'
        });
    });

    app.get('/notifier',authed,function(request,response){
        response.json(request.user.notifier.map(
            function(notifier){
                return {
                    id:notifier.id
                  , planner:{
                        host:notifier.planner.host
                      , port:notifier.planner.port
                    }
                };
            }));
    });

    app.put('/notifier',authed,function(request,response){
        if(schema.js.validate(request.body,schema.notifier_planners).length==0){
            var user=request.user
              , id=request.user.id
              , sid=request.sessionID

            if(sockets[id]){
                sockets[id].forEach(function(socket){
                    socket.disconnect();
                });
            }
            sockets[id]=[];

            request.user.notifier=request.body.map(function(element){
                var host=validate.toValidHost(element.planner.host)
                  , port=validate.toInt(element.planner.port)
                  , plannerid=get_planner(user,host,port)

                if(plannerid){
                    sockets[id].push(socket_connect(
                        plannerid,host,port,notifier,sid));

                    return {
                        id:plannerid
                      , planner:{
                            host:host
                          , port:port
                        }
                    };
                }else{
                    return;
                }
            }).filter(function(element){
                return element!=undefined;
            })
            request.user.save();

            notifier(sid,{
                action:'put'
              , msg:request.user.notifier.map(function(element){
                    return {
                        id:get_planner(user,
                            element.planner.host,element.planner.port)
                      , planner:{
                            host:element.planner.host
                          , port:element.planner.port
                        }
                    }
                })
            });
            response.status(201).json(_success.ok);
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/notifier',authed,function(request,response){
        if(schema.js.validate(request.body,schema.notifier_planner).length==0){
            var planner=get_element(request.body,request.user.notifier)

            if(!planner){
                var host=validate.toValidHost(request.body.planner.host)
                  , port=validate.toInt(request.body.planner.port)
                  , user=request.user
                  , id=request.user.id
                  , sid=request.sessionID
                  , plannerid=get_planner(user,host,port)

                if(plannerid){
                    if(!sockets[id]){
                        sockets[id]=[];
                    }
                    sockets[id].push(socket_connect(
                        plannerid,host,port,notifier,sid));

                    request.user.notifier.push({
                        id:plannerid
                      , planner:{
                            host:host
                          , port:port
                        }
                    });
                    request.user.save();

                    notifier(sid,{
                        action:'post'
                      , msg:{
                            id:plannerid
                          , planner:{
                                host:host
                              , port:port
                            }
                        }
                    });
                    response.status(201).json(_success.ok);
                }else{
                    response.status(404).json(_error.notfound);
                }
            }else{
                response.status(403).json(_error.notoverride);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/notifier',authed,function(request,response){
        var user=request.user
          , id=request.user.id
          , sid=request.sessionID

        if(sockets[id]){
            sockets[id].forEach(function(socket){
                socket.disconnect();
            });
        }
        sockets[id]=[];

        request.user.notifier=[];
        request.user.save();

        notifier(sid,{
            action:'delete'
        });
        response.status(200).json(_success.ok);
    });

    app.post('/notifier/_add',authed,function(request,response){
        if(schema.js.validate(request.body,schema.notifier_planner).length==0){
            var planner=get_element(request.body,request.user.notifier)
              , host=validate.toValidHost(request.body.planner.host)
              , port=validate.toInt(request.body.planner.port)
              , id=request.user.id
              , sid=request.sessionID
              , plannerid=get_planner(request.user,host,port)

            if(!planner){
                if(!sockets[id]){
                    sockets[id]=[];
                }
                sockets[id].push(socket_connect(
                    plannerid,host,port,notifier,sid));

                request.user.notifier.push({
                    id:plannerid
                  , planner:{
                        host:host
                      , port:port
                    }
                });
                request.user.save();

                notifier(sid,{
                    action:'create'
                  , msg:{
                        id:plannerid
                      , planner:{
                            host:host
                          , port:port
                        }
                    }
                });
                response.status(201).json(_success.ok);
            }else{
                notifier(sid,{
                    action:'update'
                  , msg:{
                        id:plannerid
                      , planner:{
                            host:host
                          , port:port
                        }
                    }
                });
                response.status(200).json(_success.ok);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.post('/notifier/_remove',authed,function(request,response){
        if(schema.js.validate(request.body,schema.notifier_planner).length==0){
            var planner=get_element(request.body,request.user.notifier)
              , id=request.user.id
              , sid=request.sessionID
              , plannerid=get_planner(request.user,host,port)

            if(planner){
                var host=planner[1].planner.host
                  , port=planner[1].planner.port

                sockets[id][planner[0]].disconnect();
                sockets[id].splice(planner[0],1);

                request.user.notifier.splice(planner[0],1);
                request.user.save();

                notifier(sid,{
                    action:'remove'
                  , msg:{
                        id:plannerid
                    }
                });
                response.status(200).json(_success.ok);
            }else{
                response.status(404).json(_error.notfound);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });
};

