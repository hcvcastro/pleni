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

    app.get('/notifiers/:planner',function(request,response){
        var id=validate.toString(request.params.planner)
          , notifier=get_element(id,app.get('notifiers'))

        if(notifier){
            response.status(200).json({
                id:notifier[1].id
              , planner:{
                    host:notifier[1].planner.host
                  , port:notifier[1].planner.port
                }
            });
            return;
        }

        response.status(404).json(_error.notfound);
    });

    app.put('/notifiers/:planner',function(request,response){
        var id=validate.toString(request.params.planner)
          , notifiers=app.get('notifiers')
          , notifier=get_element(id,notifiers)

        if(schema.js.validate(request.body,schema.planner).length==0){
            var host=validate.toValidHost(request.body.planner.host)
              , port=validate.toInt(request.body.planner.port)

            if(notifier){
                notifiers[notifier[0]].socket.disconnect();

                notifiers[notifier[0]].socket=socket_connect(host+':'+port);
                notifiers[notifier[0]].planner.host=host;
                notifiers[notifier[0]].planner.port=port;

                app.set('notifiers',notifiers);
                response.status(200).json(_success.ok);
            }else{
                notifiers.push({
                    id:id
                  , planner:{
                        host:host
                      , port:port
                    }
                  , socket:socket_connect(host+':'+port)
                })

                app.set('notifiers',notifiers);
                response.status(201).json(_success.ok);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/notifiers/:planner',function(request,response){
        var id=validate.toString(request.params.planner)
          , notifiers=app.get('notifiers')
          , notifier=get_element(id,notifiers)

        if(notifier){
            notifiers.splice(notifier[0],1);
            app.set('notifiers',notifiers);
            response.status(200).json(_success.ok);
        }else{
            response.status(404).json(_error.notfound);
        }
    });
};

