'use strict';

module.exports=function(app,user){
    app.get('/signin',function(request,response){
        response.render('pages/signin');
    });

    app.get('/signup',function(request,response){
        response.render('pages/signup');
    });
};

