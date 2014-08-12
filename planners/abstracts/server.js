'use strict';

var http=require('http')
  , express=require('express')
  , bodyparser=require('body-parser')
  , app=express()

exports.set=function(port){
    app.set('port',port);
    app.disable('x-powered-by');
    app.use(bodyparser.json());

    app.get('/',function(request,response){
        response.json({planner:'ready for action'});
    });
};

exports.listen=function(planner){
    app.get('/_status',function(request,response){
        response.json(planner.status());
    });
    app.post('/_run',function(request,response){
        response.json(planner.run());
    });
    app.post('/_stop',function(request,response){
        response.json(planner.stop());
    });

    app.get('/:task',function(request,response){
        response.json(planner.gettask());
    });
    app.put('/:task',function(request,response){
        response.json(planner.addtask());
    });
    app.delete('/:tid',function(request,response){
        response.json(planner.removeTask());
    });
};

module.exports.run=function(){
    http.createServer(app).listen(app.get('port'),function(){
        console.log('Express server listening on port '+app.get('port'));
    });
};

//module.exports.app=app;
//module.exports.messages=messages;

