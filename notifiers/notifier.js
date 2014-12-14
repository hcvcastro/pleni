'use strict';

var http=require('http')
  , express=require('express')
  , join=require('path').join
  , _success=require('../planners/utils/json-response').success
  , _error=require('../planners/utils/json-response').error
  , bodyparser=require('body-parser')
  , app=express()
  , server=http.Server(app)
  , ios=require('socket.io')(server)
  , ioc=require('socket.io-client')
  , planners={}
  , schema=require('../master/utils/schema')
  , get_element=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].id==needle){
                return [i,haystack[i]];
            }
        }
        return;
    };

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

app.post('/notifier',function(request,response){
    if(schema.js.validate(request.body,schema.planner).length==0){
        var planner=request.body
          , socket=ioc.connect(
                planner.planner.host+':'+planner.planner.port,{reconnect:true})

        socket.on('connection',function(msg){
            ios.emit('notifier',msg);
        });
        socket.on('notifier',function(msg){
            ios.emit('notifier',msg);
        });

        planners[planner.planner.id]=socket;
        response.status(201).json(_success.ok);
    }else{
        response.status(400).json(_error.json);
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

