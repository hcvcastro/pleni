'use strict';

module.exports=function(app){
    app.get('/',function(request,response){
        if(request.user){
            response.cookie('pleni.auth',JSON.stringify({
                role:'user'
            }));
        }
        response.render('dev');
    });

    app.get('/home',function(request,response){
        response.render('pages/home');
    });
};

