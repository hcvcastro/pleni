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
        response.json(planner.status(response));
    });
    app.post('/_run',function(request,response){
        response.json(planner.run(response));
    });
    app.post('/_stop',function(request,response){
        response.json(planner.stop(response));
    });

    app.put('/:task',function(request,response){
        response.json(
            planner.settask(
                request.params.task,
                request.query,
                request.body,
                response));
    });
    app.get('/:tid',function(request,response){
        response.json(
            planner.gettask(request.params.tid,response));
    });
    app.delete('/:tid',function(request,response){
        response.json(
            planner.removetask(request.params.tid,response));
    });
};

module.exports.run=function(){
    return http.createServer(app).listen(app.get('port'),function(){
        console.log('Express server listening on port '+app.get('port'));
    });
};

module.exports.app=app;

