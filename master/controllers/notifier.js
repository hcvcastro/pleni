'use strict';

var validate=require('../../planners/utils/validators')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , schema=require('../utils/schema')
  , get_element=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].planner.host==needle.planner.host
                &&haystack[i].planner.port==needle.planner.port){
                return [i,haystack[i]];
            }
        }
        return;
    }
  , socket_connect=function(ios,ioc,host){
        var socket=ioc.connect(host,{reconnect:true})
        socket.on('connection',function(msg){
            ios.emit('notifier',msg);
        });
        socket.on('notifier',function(msg){
            ios.emit('notifier',msg);
        });
        return socket;
    }

module.exports=function(app,ios,ioc){
    app.get('/id',function(request,response){
        response.json({
            master:'ready for action'
          , notifier:'ready for action'
          , signature:'io'
        });
    });

    app.get('/notifier',function(request,response){
        var notifier=app.get('notifier')

        response.json(notifier.map(
            function(notifier){
                return {
                    planner:{
                        host:notifier.planner.host
                      , port:notifier.planner.port
                    }
                };
            }));
    });

    app.put('/notifier',function(request,response){
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
                  , socket:socket_connect(ios,ioc,host+':'+port)
                }
            }));

            response.status(201).json(_success.ok);
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/notifier',function(request,response){
        if(schema.js.validate(request.body,schema.notifier_planner).length==0){
            var planner=get_element(request.body,app.get('notifier'))

            if(!planner){
                var host=validate.toValidHost(request.body.planner.host)
                  , port=validate.toInt(request.body.planner.port)

                app.get('notifier').push({
                    planner:{
                        host:host
                      , port:port
                    }
                  , socket:socket_connect(ios,ioc,host+':'+port)
                });
                response.status(201).json(_success.ok);
            }else{
                response.status(403).json(_error.notoverride);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/notifier',function(request,response){
        app.get('notifier').forEach(function(notifier){
            notifier.socket.disconnect();
        });

        app.set('notifier',new Array());
        response.status(200).json(_success.ok);
    });

    app.post('/notifier/_add',function(request,response){
        if(schema.js.validate(request.body,schema.notifier_planner).length==0){
            var notifier=app.get('notifier')
              , planner=get_element(request.body,notifier)
              , host=validate.toValidHost(request.body.planner.host)
              , port=validate.toInt(request.body.planner.port)

            if(!planner){
                notifier.push({
                    planner:{
                        host:host
                      , port:port
                    }
                  , socket:socket_connect(ios,ioc,host+':'+port)
                });

                app.set('notifier',notifier);
                response.status(201).json(_success.ok);
            }else{
                notifier[planner[0]].socket.disconnect();

                notifier[planner[0]].planner.host=host;
                notifier[planner[0]].planner.port=port;
                notifier[planner[0]].socket=socket_connect(
                    ios,ioc,host+':'+port);

                app.set('notifier',notifier);
                response.status(200).json(_success.ok);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.post('/notifier/_remove',function(request,response){
        if(schema.js.validate(request.body,schema.notifier_planner).length==0){
            var notifier=app.get('notifier')
              , planner=get_element(request.body,notifier)
              , host=validate.toValidHost(request.body.planner.host)
              , port=validate.toInt(request.body.planner.port)

            if(planner){
                notifier.splice(planner[0],1);
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

