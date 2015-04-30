'use strict';

var _success=require('../../core/json-response').success
  , csurf=require('csurf')
  , csrf=csurf({cookie:true})

module.exports=function(app,passport){
    app.get('/signin',csrf,function(request,response){
        response.render('pages/signin',{
            csrftoken:request.csrfToken()
        });
    });

    app.post('/signin',csrf,passport.authenticate('local'),
        function(request,response,next){
        passport.authenticate('local',function(err,user,info){
            response.status(200).send(_success.ok);
        })(request,response,next);
    });

    app.post('/user',function(request,response){
        console.log(request.isAuthenticated());
        if(request.isAuthenticated()){
            response.send({
                user:true
            });
        }else{
            response.send({
                user:false
            });
        }
    });

    app.get('/signup',function(request,response){
        response.render('pages/signup');
    });
};

