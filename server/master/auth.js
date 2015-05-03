'use strict';

var _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , csurf=require('csurf')
  , csrf=csurf({cookie:true})

module.exports=function(app){
    var passport=app.get('passport');

    app.get('/signin',csrf,function(request,response){
        response.render('pages/signin',{
            csrftoken:request.csrfToken()
        });
    });

    app.post('/signin',csrf,function(request,response,next){
        passport.authenticate('local',function(err,user,info){
            if(err){
                return next(err);
            }
            if(!user){
                response.status(401).send(_error.auth);
            }else{
                request.login(user,function(err){
                    if(err){
                        return next(err);
                    }else{
                        response.status(200).send(_success.ok);
                    }
                });
            }
        })(request,response,next);
    });

    app.post('/profile',function(request,response){
        if(request.isAuthenticated()){
            response.send(request.user);
        }else{
            response.send({
                role:'guest'
            });
        }
    });

    app.post('/signout',function(request,response){
        if(request.isAuthenticated()){
            request.logout();
            response.status(200).send(_success.ok);
        }
    });

    app.get('/signup',function(request,response){
        response.render('pages/signup');
    });
};

