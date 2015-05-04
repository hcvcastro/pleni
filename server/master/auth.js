'use strict';

var _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , config=require('../../config/master')
  , csurf=require('csurf')
  , csrf=csurf({cookie:true})
  , nocaptcha=require('no-captcha')

module.exports=function(app){
    var passport=app.get('passport')
      , captcha=new nocaptcha(config.recaptcha.public,config.recaptcha.private);

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
                        response.cookie('pleni.auth',JSON.stringify({
                            role:'user'
                        })).send(_success.ok);
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
        }
        response.status(200).send(_success.ok);
    });

    app.get('/signup',csrf,function(request,response){
        response.render('pages/signup',{
            csrftoken:request.csrfToken()
          , captcha:config.recaptcha.public
        });
    });

    app.post('/signup',csrf,function(request,response){
        captcha.verify({
            response:request.body.captcha
          , remoteip:request.connection.remoteAddress
        },function(err,res){
            if(!err){
                response.status(200).send(_success.ok);
            }else{
                response.status(403).send(_error.validation);
            }
        });
    });
};

