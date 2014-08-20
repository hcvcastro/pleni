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
        planner.status(request,response);
    });
    app.get('/_api',function(request,response){
        planner.api(request,response);
    });
    app.post('/',function(request,response){
        planner.create(request,response);
    });

    app.get('/:tid',function(request,response){
        planner.get(request,response);
    });
    app.delete('/:tid',function(request,response){
        planner.remove(request,response);
    });

    app.post('/:tid/_run',function(request,response){
        planner.run(request,response);
    });
    app.post('/:tid/_stop',function(request,response){
        planner.stop(request,response);
    });
};

module.exports.run=function(){
    return http.createServer(app).listen(app.get('port'),function(){
        console.log('Express server listening on port '+app.get('port'));
    });
};

module.exports.app=app;

