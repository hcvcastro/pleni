'use strict';

var app=require('express')()
  , http=require('http').Server(app)
  , bodyparser=require('body-parser')

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

exports.run=function(){
    return http.listen(app.get('port'),function(){
        console.log('Express server listening on port '+app.get('port'));
    });
};

module.exports.http=http;
module.exports.app=app;

