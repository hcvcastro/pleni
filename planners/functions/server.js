'use strict';

var http=require('http')
  , express=require('express')
  , bodyparser=require('body-parser')
  , app=express()

var messages={
    ready:  {planner:'ready'        }
  , run:    {planner:'task running' }
  , stop:   {planner:'task stopping'}
  , add:    {planner:'task added'   }
  , delete: {planner:'task deleted' }
}

module.exports=function(planner,port) {
    app.set('port',port);
    app.disable('x-powered-by');
    app.use(bodyparser.json());

    app.get('/',function(request,response){
        response.json(messages.ready);
    });
    app.post('/run',function(request,response){
        planner['run']();
        response.json(messages.run);
    });
    app.post('/stop',function(request,response){
        planner['stop']();
        response.json(messages.stop);
    });
    app.get('/status',function(request,response){
        planner['status']();
        response.json(messages.ready);
    });
    app.put('/',function(request,response){
        response.json(messages.add);
    });
    app.delete('/',function(request,response){
        response.json(messages.delete);
    });

    http.createServer(app).listen(app.get('port'),function(){
        console.log('Express server listening on port '+app.get('port'));
    });
}

module.exports.app=app;
module.exports.messages=messages;

