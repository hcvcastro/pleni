'use strict';

var authed=require('./auth/authed')

module.exports=function(app){
    app.get('/resources/view',authed,function(request,response){
        response.render('pages/resources');
    });
};

