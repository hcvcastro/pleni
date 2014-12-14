'use strict';

var join=require('path').join

module.exports=function(app){
    app.get('/id',function(request,response){
        response.json({
            notifier:'ready for action'
        });
    });

    app.get('/msg.html',function(request,response){
        response.sendFile(join(__dirname,'public','msg.html'));
    });
};

