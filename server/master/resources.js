'use strict';

var join=require('path').join

module.exports=function(app,config){
    var authed=app.get('auth');

    app.get('/resources/view',authed,function(request,response){
        if(config.env=='production'){
            response.status(200)
                .sendFile(join(__dirname,'..','..','client',
                    'resources.html'));
        }else{
            response.render('pages/resources');
        }
    });
};

