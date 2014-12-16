'use strict';

var validate=require('../../planners/utils/validators')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , schema=require('../../master/utils/schema')
  , get_element=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].id==needle){
                return [i,haystack[i]];
            }
        }
        return;
    }

module.exports=function(app,ios,ioc){
    var socket_connect=function(host){
        var socket=ioc.connect(host,{reconnect:true})
        socket.on('connection',function(msg){
            ios.emit('notifier',msg);
        });
        socket.on('notifier',function(msg){
            ios.emit('notifier',msg);
        });
        return socket;
    };

    app.get('/notifiers',function(request,response){
        response.json(app.get('notifiers').map(
            function(notifier){
                return {
                    planner:{
                        host:notifier.planner.host
                      , port:notifier.planner.port
                    }
                };
            }));
    });

    app.put('/notifiers',function(request,response){
        if(schema.js.validate(request.body,schema.notifier_planners).length==0){
            app.get('notifiers').forEach(function(notifier){
                notifier.socket.disconnect();
            });

            app.set('notifiers',request.body.map(function(element){
                var host=validate.toValidHost(element.planner.host)
                  , port=validate.toInt(element.planner.port)

                return {
                    host:host
                  , port:port
                  , socket:socket_connect(host+':'+port)
                }
            }));
            response.status(201).json(_success.ok);
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/notifiers',function(request,response){
        if(schema.js.validate(request.body,schema.planner).length==0){
            var socket=get_element(request.body.id,app.get('notifiers'))

            if(!socket){
                var host=validate.toValidHost(request.body.planner.host)
                  , port=validate.toInt(request.body.planner.port)

                app.get('notifiers').push({
                    host:host
                  , port:port
                  , socket:socket_connect(host+':'+port)
                })
                response.status(201).json(_success.ok);
            }else{
                response.status(403).json(_error.notoverride);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/notifiers',function(request,response){
        app.get('notifiers').forEach(function(notifier){
            notifier.socket.disconnect();
        });

        app.set('notifiers',new Array());
        response.status(200).json(_success.ok);
    });
};

