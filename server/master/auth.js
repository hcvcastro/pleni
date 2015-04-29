'use strict';

module.exports=function(app,user,csrf,bodyjson){
    app.get('/signin',csrf,function(request,response){
        response.render('pages/signin',{
            csrftoken:request.csrfToken()
        });
    });

    app.post('/signin',bodyjson,csrf,function(request,response){
        res.send('data is being processing');
    });

    app.get('/signup',function(request,response){
        response.render('pages/signup');
    });
};

