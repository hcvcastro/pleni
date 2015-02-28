'use strict';

module.exports=function(app){
    app.get('/',function(request,response){
        response.render('dev');
    });

    app.get('/home',function(request,response){
        response.render('pages/home');
    });
};

