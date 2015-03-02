'use strict';

var http=require('http')
  , express=require('express')
  , bodyparser=require('body-parser')
  , app=express()
  , server=http.Server(app)
  , morgan=require('morgan')
  , join=require('path').join
  , validate=require('../core/validators')
  , _success=require('../core/json-response').success
  , _error=require('../core/json-response').error
  , schema=require('../core/schema')
  , ios=require('socket.io')(server)
  , ioc=require('socket.io-client')
  , planners=new Array()
  , get_element=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].planner.host==needle.planner.host
                &&haystack[i].planner.port==needle.planner.port){
                return [i,haystack[i]];
            }
        }
        return;
    }
  , socket_connect=function(host){
        var socket=ioc.connect(host,{reconnect:true})
        socket.on('notifier',function(msg){
            msg.id=host;
            ios.emit('notifier',msg);
        });
        return socket;
    };

app.set('planners',planners);
app.set('port',process.env.PORT||3002);
app.set('views',join(__dirname,'views'));
app.disable('x-powered-by');

app.use(bodyparser.json());
app.use(morgan('dev'));
app.use(express.static(join(__dirname,'public')));
app.use(express.static(join(__dirname,'..','bower_components')));

app.get('/id',function(request,response){
    response.json({
        notifier:'ready for action'
      , signature:'io'
    });
});

app.get('/msg.html',function(request,response){
    response.sendFile(join(__dirname,'..','client','notifiers','msg.html'));
});

app.get('/notifier',function(request,response){
    response.json(app.get('planners').map(
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
        app.get('planners').forEach(function(notifier){
            notifier.socket.disconnect();
        });

        app.set('planners',request.body.map(function(element){
            var host=validate.toValidHost(element.planner.host)
              , port=validate.toInt(element.planner.port)

            return {
                planner:{
                    host:host
                  , port:port
                }
              , socket:socket_connect(host+':'+port)
            }
        }));

        ios.emit('notifier',{
            action:'put'
          , msg:app.get('planners').map(function(element){
                return {
                    planner:{
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

app.post('/notifier',function(request,response){
    if(schema.js.validate(request.body,schema.notifier_planner).length==0){
        var planner=get_element(request.body,app.get('planners'))

        if(!planner){
            var host=validate.toValidHost(request.body.planner.host)
              , port=validate.toInt(request.body.planner.port)

            app.get('planners').push({
                planner:{
                    host:host
                  , port:port
                }
              , socket:socket_connect(host+':'+port)
            });

            ios.emit('notifier',{
                action:'post'
              , msg:{
                    planner:{
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

app.delete('/notifier',function(request,response){
    app.get('planners').forEach(function(notifier){
        notifier.socket.disconnect();
    });

    app.set('planners',new Array());

    ios.emit('notifier',{
        action:'delete'
    });
    response.status(200).json(_success.ok);
});

app.post('/notifier/_add',function(request,response){
    if(schema.js.validate(request.body,schema.notifier_planner).length==0){
        var planners=app.get('planners')
          , planner=get_element(request.body,planners)
          , host=validate.toValidHost(request.body.planner.host)
          , port=validate.toInt(request.body.planner.port)

        if(!planner){
            planners.push({
                planner:{
                    host:host
                  , port:port
                }
              , socket:socket_connect(host+':'+port)
            });

            app.set('planners',planners);

            ios.emit('notifier',{
                action:'add'
              , msg:{
                    planner:{
                        host:host
                      , port:port
                    }
                }
            });
            response.status(201).json(_success.ok);
        }else{
            planners[planner[0]].socket.disconnect();

            planners[planner[0]].planner.host=host;
            planners[planner[0]].planner.port=port;
            planners[planner[0]].socket=socket_connect(host+':'+port);

            app.set('planners',planners);

            ios.emit('notifier',{
                action:'override'
              , msg:{
                    planner:{
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

app.post('/notifier/_remove',function(request,response){
    if(schema.js.validate(request.body,schema.notifier_planner).length==0){
        var planners=app.get('planners')
          , planner=get_element(request.body,planners)

        if(planner){
            planners.splice(planner[0],1);
            app.set('planners',planners);

            ios.emit('notifier',{
                action:'remove'
              , msg:{
                    planner:{
                        host:planner[1].host
                      , port:planner[1].port
                    }
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

ios.sockets.on('connection',function(socket){
    socket.emit('notifier',{
        notifier:{
            action:'connection'
        }
    });
});

server.listen(app.get('port'),'localhost',function(){
    console.log('pleni ✯ notifier: listening on port '
        +app.get('port')+'\n');
});

module.exports=app;

