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
        return user.resources.planners.find(function(p){
            return p.planner.host==host&&p.planner.port==port;
        });
    }

module.exports=function(app,config,notifier){
    var authed=app.get('auth')
      , get_session=function(id,done,fail){
            var sid=config.redis.prefix+id

            app.get('redis').get(sid,function(err,reply){
                if(reply){
                    done(JSON.parse(reply));
                }else if(fail){
                    fail(err);
                }
            });
        }
      , socket_connect=function(id,host,port,virtual,user,seed,notifier,sid){
            var opts={
                    reconnect:true
                  , 'forceNew':true
                }
            
            if(virtual){
                opts.query=[
                    'apikey='+config.monitor.apikey
                  , 'id='+user
                  , 'seed='+seed
                ].join('&');
            }
            
            var socket=ioc.connect(host+':'+port,opts)
            socket.on('notifier',function(msg){
                get_session(sid,function(session){
                    var params=[]

                    if(session.planners&&(id in session.planners)){
                        params=session.planners[id];
                    }

                    notifier(sid,{
                        action:'planner'
                      , id:id
                      , params:params
                      , planner:msg
                    });
                });
            });
            return socket;
        }


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
            var id=request.user.id
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
                  , planner=get_planner(request.user,host,port)

                if(planner){
                    sockets[id].push(socket_connect(
                        planner.id,host,port,planner.attrs.virtual,
                        request.user._id,planner.id,notifier,sid));

                    return {
                        id:planner.id
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
                        id:get_planner(request.user,
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
            var _planner=get_element(request.body,request.user.notifier)

            if(!_planner){
                var host=validate.toValidHost(request.body.planner.host)
                  , port=validate.toInt(request.body.planner.port)
                  , id=request.user.id
                  , sid=request.sessionID
                  , planner=get_planner(request.user,host,port)

                if(planner){
                    if(!sockets[id]){
                        sockets[id]=[];
                    }
                    sockets[id].push(socket_connect(
                        planner.id,host,port,planner.attrs.virtual,
                        request.user._id,planner.id,notifier,sid));

                    request.user.notifier.push({
                        id:planner.id
                      , planner:{
                            host:host
                          , port:port
                        }
                    });
                    request.user.save();

                    notifier(sid,{
                        action:'post'
                      , msg:{
                            id:planner.id
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
        var id=request.user.id
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
            var _planner=get_element(request.body,request.user.notifier)
              , host=validate.toValidHost(request.body.planner.host)
              , port=validate.toInt(request.body.planner.port)
              , id=request.user.id
              , sid=request.sessionID
              , planner=get_planner(request.user,host,port)

            if(planner){
                if(!_planner){
                    if(!sockets[id]){
                        sockets[id]=[];
                    }
                    sockets[id].push(socket_connect(
                        planner.id,host,port,planner.attrs.virtual,
                        request.user._id,planner.id,notifier,sid));

                    request.user.notifier.push({
                        id:planner.id
                      , planner:{
                            host:host
                          , port:port
                        }
                    });
                    request.user.save();

                    notifier(sid,{
                        action:'create'
                      , msg:{
                            id:planner.id
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
                            id:planner.id
                          , planner:{
                                host:host
                              , port:port
                            }
                        }
                    });
                    response.status(200).json(_success.ok);
                }
            }else{
                response.status(404).json(_error.notfound);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.post('/notifier/_remove',authed,function(request,response){
        if(schema.js.validate(request.body,schema.notifier_planner).length==0){
            var _planner=get_element(request.body,request.user.notifier)
              , id=request.user.id
              , sid=request.sessionID

            if(_planner){
                var host=_planner[1].planner.host
                  , port=_planner[1].planner.port
                  , planner=get_planner(request.user,host,port)

                if(sockets[id]){
                    sockets[id][_planner[0]].disconnect();
                    sockets[id].splice(_planner[0],1);
                }

                request.user.notifier.splice(_planner[0],1);
                request.user.save();

                notifier(sid,{
                    action:'remove'
                  , msg:{
                        id:planner.id
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

