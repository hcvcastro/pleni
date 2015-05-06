'use strict';

var validate=require('../../core/validators')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , schema=require('../../core/schema')
  , get_element=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].planner.host==needle.planner.host
                &&haystack[i].planner.port==needle.planner.port){
                return [i,haystack[i]];
            }
        }
        return;
    }
  , get_planner=function(host,port,app){
        var planners=app.get('resources').planners

        for(var i in planners){
            if(planners[i].planner.host==host&&
               planners[i].planner.port==port){
                return planners[i].id;
            }
        }
        return null;
    }
  , socket_connect=function(ios,ioc,host,port,id){
        var socket=ioc.connect(host+':'+port,{reconnect:true,'forceNew':true})
        socket.on('notifier',function(msg){
            ios.emit('notifier',{
                action:'planner'
              , id:id
              , planner:msg
            });
        });
        return socket;
    }

module.exports=function(app,ios,ioc){
    var authed=app.get('auth');

    app.get('/id',function(request,response){
        response.json({
            master:'ready for action'
          , notifier:'ready for action'
          , signature:'io'
        });
    });

    app.get('/notifier',authed,function(request,response){
        var notifier=app.get('notifier')

        response.json(notifier.map(
            function(notifier){
                return {
                    id:get_planner(
                        notifier.planner.host,notifier.planner.port,app)
                  , planner:{
                        host:notifier.planner.host
                      , port:notifier.planner.port
                    }
                };
            }));
    });

    app.put('/notifier',authed,function(request,response){
        if(schema.js.validate(request.body,schema.notifier_planners).length==0){
            app.get('notifier').forEach(function(notifier){
                notifier.socket.disconnect();
            });

            app.set('notifier',request.body.map(function(element){
                var host=validate.toValidHost(element.planner.host)
                  , port=validate.toInt(element.planner.port)

                return {
                    planner:{
                        host:host
                      , port:port
                    }
                  , socket:socket_connect(
                        ios,ioc,host,port,get_planner(host,port,app))
                }
            }));

            ios.emit('notifier',{
                action:'put'
              , msg:app.get('notifier').map(function(element){
                    return {
                        id:get_planner(
                            element.planner.host,element.planner.port,app)
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
            var planner=get_element(request.body,app.get('notifier'))

            if(!planner){
                var host=validate.toValidHost(request.body.planner.host)
                  , port=validate.toInt(request.body.planner.port)
                  , id=get_planner(host,port,app)

                app.get('notifier').push({
                    planner:{
                        host:host
                      , port:port
                    }
                  , socket:socket_connect(ios,ioc,host,port,id)
                });

                ios.emit('notifier',{
                    action:'post'
                  , msg:{
                        id:id
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
        app.get('notifier').forEach(function(notifier){
            notifier.socket.disconnect();
        });

        app.set('notifier',new Array());

        ios.emit('notifier',{
            action:'delete'
        });
        response.status(200).json(_success.ok);
    });

    app.post('/notifier/_add',authed,function(request,response){
        if(schema.js.validate(request.body,schema.notifier_planner).length==0){
            var notifier=app.get('notifier')
              , planner=get_element(request.body,notifier)
              , host=validate.toValidHost(request.body.planner.host)
              , port=validate.toInt(request.body.planner.port)
              , id=get_planner(host,port,app)

            if(!planner){
                app.get('notifier').push({
                    planner:{
                        host:host
                      , port:port
                    }
                  , socket:socket_connect(ios,ioc,host,port,id)
                });

                ios.emit('notifier',{
                    action:'create'
                  , msg:{
                        id:id
                      , planner:{
                            host:host
                          , port:port
                        }
                    }
                });
                response.status(201).json(_success.ok);
            }else{
                ios.emit('notifier',{
                    action:'update'
                  , msg:{
                        id:id
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
            var notifier=app.get('notifier')
              , planner=get_element(request.body,notifier)

            if(planner){
                var host=planner[1].planner.host
                  , port=planner[1].planner.port

                notifier[planner[0]].socket.disconnect();
                notifier.splice(planner[0],1);

                ios.emit('notifier',{
                    action:'remove'
                  , msg:{
                        id:get_planner(host,port,app)
                    }
                });
                app.set('notifier',notifier);

                response.status(200).json(_success.ok);
            }else{
                response.status(404).json(_error.notfound);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });
};

