'use strict';

module.exports=function(app,user){
    app.get('/',function(request,response){
        response.render('dev',{user:user});
    });

    app.get('/home',function(request,response){
        response.render('pages/home');
    });
};

