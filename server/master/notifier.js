'use strict';

var validate=require('../../core/validators')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , schema=require('../../core/schema')
  , ioc=require('socket.io-client')
  , sockets={}
  , get_element=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].host==needle.planner.host
                &&haystack[i].port==needle.planner.port){
                return [i,haystack[i]];
            }
        }
        return;
    }
  , get_planner=function(user,host,port){
        var planners=user.resources.planners

        for(var i in planners){
            if(planners[i].host==host&&planners[i].port==port){
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
                    id:get_planner(request.user,notifier.host,notifier.port)
                  , planner:{
                        host:notifier.host
                      , port:notifier.port
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

                sockets[id].push(socket_connect(
                    plannerid,host,port,notifier,sid));

                return {
                    host:host
                  , port:port
                };
            });
            request.user.save();

            notifier(sid,{
                action:'put'
              , msg:request.user.notifier.map(function(element){
                    return {
                        id:get_planner(user,element.host,element.port)
                      , planner:{
                            host:element.host
                          , port:element.port
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

                if(!sockets[id]){
                    sockets[id]=[];
                }
                sockets[id].push(socket_connect(
                    plannerid,host,port,notifier,sid));

                request.user.notifier.push({
                    host:host
                  , port:port
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
                    host:host
                  , port:port
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
                var host=planner[1].host
                  , port=planner[1].port

                sockets[id][planner[0]].disconnect();
                sockets[id].splice(planner[0],1);

                request.user.notifier.splice(planner[0],1);
                request.user.save();

                notifier(sid,{
                    action:'remove'
                  , msg:{
                        id:get_planner(request.user,host,port,app)
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

