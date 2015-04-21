'use strict';

var app=require('express')()
  , http=require('http').Server(app)
  , bodyparser=require('body-parser')
  , morgan=require('morgan')
  , fs=require('fs')
  , join=require('path').join
  , config=require('../../config/planner')
  , type=''

exports.set=function(host,port,signature){
    app.set('host',host);
    app.set('port',port);
    app.disable('x-powered-by');
    app.use(bodyparser.json());

    if(config.env=='production'){
        app.use(morgan('combined'));
    }else{
        app.use(morgan('dev'));
    }

    type=signature;
    app.get('/id',function(request,response){
        response.status(200).json({
            planner:'ready for action'
          , type:signature
        });
    });

    fs.writeFile(join(__dirname,'..','..','run',port.toString()),'',
        function(err){
        if(err) throw err;
    });

    var destroy=function(){
        http.close(function(){
            fs.unlink(join(__dirname,'..','..','run',port),function(err){
                if(err) throw err;
            });
        });
        console.log('Bye bye!!');
        process.exit(0);
    };

    process.on('SIGINT',destroy);
    process.on('SIGTERM',destroy);
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
    return http.listen(app.get('port'),app.get('host'),function(){
        console.log('pleni ✯ planner '+type+': listening on '
            +app.get('host')+':'+app.get('port')+'\n');
    });
};

module.exports.http=http;
module.exports.app=app;

