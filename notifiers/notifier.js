'use strict';

var http=require('http')
  , express=require('express')
  , join=require('path').join
  , validate=require('../planners/utils/validators')
  , _success=require('../planners/utils/json-response').success
  , _error=require('../planners/utils/json-response').error
  , bodyparser=require('body-parser')
  , app=express()
  , server=http.Server(app)
  , ios=require('socket.io')(server)
  , ioc=require('socket.io-client')
  , sockets=new Array()
  , schema=require('../master/utils/schema')
  , get_element=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].id==needle){
                return [i,haystack[i]];
            }
        }
        return;
    }
  , socket_connect=function(host){
        var socket=ioc.connect(host,{reconnect:true})
        socket.on('connection',function(msg){
            ios.emit('notifier',msg);
        });
        socket.on('notifier',function(msg){
            ios.emit('notifier',msg);
        });
        return socket;
    }

app.set('port',process.env.PORT||3002);
app.set('views',join(__dirname,'views'));
app.disable('x-powered-by');

app.use(bodyparser.json());
app.use(express.static(join(__dirname,'public')));
app.use(express.static(join(__dirname,'..','bower_components')));

app.get('/notifier',function(request,response){
    response.json({
        notifier:'ready for action'
    });
});
app.get('/msg.html',function(request,response){
    response.sendFile(join(__dirname,'public','msg.html'));
});

app.put('/notifier',function(request,response){
    if(schema.js.validate(request.body,schema.planners).length==0){
        for(var socket in sockets){
            sockets[socket].socket.disconnect();
            delete sockets[socket];
        }
        sockets=request.body.map(function(socket){
            var host=validate.toValidHost(socket.planner.host)
              , port=validate.toInt(socket.planner.port)

            return {
                id:validate.toString(socket.id)
              , planner:{
                    host:host
                  , port:port
                }
              , socket:socket_connect(host+':'+port)
            }
        });
        response.status(201).json(_success.ok);
    }else{
        response.status(400).json(_error.json);
    }
});

app.post('/notifier',function(request,response){
    if(schema.js.validate(request.body,schema.planner).length==0){
        var socket=get_element(request.body.id,sockets)

        if(!socket){
            var host=validate.toValidHost(request.body.planner.host)
              , port=validate.toInt(request.body.planner.port)

            sockets.push({
                id:validate.toString(request.body.id)
              , planner:{
                    host:host
                  , port:port
                }
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

app.delete('/notifier',function(request,response){
    for(var socket in sockets){
        sockets[socket].socket.disconnect();
        delete sockets[socket];
    }
    response.status(200).json(_success.ok);
});

app.get('/notifier/:planner',function(request,response){
    var id=validate.toString(request.params.planner)
      , socket=get_element(id,sockets)

    if(socket){
        response.status(200).json({
            id:socket[1].id
          , planner:{
                host:socket[1].planner.host
              , port:socket[1].planner.port
            }
        });
        return;
    }

    response.status(404).json(_error.notfound);
});

app.put('/notifier/:planner',function(request,response){
    var id=validate.toString(request.params.planner)
      , socket=get_element(id,sockets)

    if(schema.js.validate(request.body,schema.planner).length==0){
        var host=validate.toValidHost(request.body.planner.host)
          , port=validate.toInt(request.body.planner.port)

        if(socket){
            sockets[socket[0]].socket.disconnect();
            sockets[socket[0]].socket=socket_connect(host+':'+port);
            sockets[socket[0]].planner.host=host;
            sockets[socket[0]].planner.port=port;

            response.status(200).json(_success.ok);
        }else{
            sockets.push({
                id:id
              , planner:{
                    host:host
                  , port:port
                }
              , socket:socket_connect(host+':'+port)
            })
            response.status(201).json(_success.ok);
        }
    }else{
        response.status(403).json(_error.validation);
    }
});

app.delete('/notifier/:planner',function(request,response){
    var id=validate.toString(request.params.planner)
      , socket=get_element(id,sockets)

    if(socket){
        sockets.splice(socket[0],1);
        response.status(200).json(_success.ok);
    }else{
        response.status(404).json(_error.notfound);
    }
});

ios.sockets.on('connection',function(socket){
    socket.emit('notifier',{
        notifier:{
            action:'connection'
        }
    });
});

server.listen(app.get('port'),function(){
    console.log('Notifier APP listening on port '+app.get('port'));
});

module.exports=app;

