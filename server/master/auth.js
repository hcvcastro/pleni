'use strict';

var _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , config=require('../../config/master')
  , csurf=require('csurf')
  , csrf=csurf({cookie:true})
  , nocaptcha=require('no-captcha')
  , User=require('./models/user')

module.exports=function(app){
    var passport=app.get('passport')
      , captcha=new nocaptcha(config.recaptcha.public,config.recaptcha.private);

    app.get('/signin',csrf,function(request,response){
        response.render('pages/signin',{
            csrftoken:request.csrfToken()
        });
    });

    app.get('/signup',csrf,function(request,response){
        response.render('pages/signup',{
            csrftoken:request.csrfToken()
          , captcha:config.recaptcha.public
        });
    });

    app.get('/forgot',csrf,function(request,response){
        response.render('pages/forgot',{
            csrftoken:request.csrfToken()
          , captcha:config.recaptcha.public
        });
    });

    app.post('/signin',csrf,function(request,response,next){
        passport.authenticate('local',function(err,user,info){
            if(err){
                return next(err);
            }
            if(!user){
                response.status(401).json(info);
            }else{
                request.login(user,function(err){
                    if(err){
                        return next(err);
                    }else{
                        response.cookie('pleni.auth',JSON.stringify({
                            role:'user'
                        })).json(_success.ok);
                    }
                });
            }
        })(request,response,next);
    });

    app.post('/profile',function(request,response){
        if(request.isAuthenticated()){
            response.json(request.user);
        }else{
            response.json({
                role:'guest'
            });
        }
    });

    app.post('/signout',function(request,response){
        if(request.isAuthenticated()){
            request.logout();
        }
        response.status(200).json(_success.ok);
    });

    app.post('/signup',csrf,function(request,response){
        captcha.verify({
            response:request.body.captcha
          , remoteip:request.connection.remoteAddress
        },function(err,res){
            if(!err){
                User.findOne({email:request.body.email},function(err,user){
                    if(!user&&config.master.admin&&
                        config.master.email!==request.body.email){
                        User.create({
                            email:request.body.email
                          , password:request.body.password
                          , status:'confirm'
                        },function(err,user){
                            if(!err){
                                response.status(200).json(_success.ok);
                            }else{
                                response.status(403).json(_error.validation);
                            }
                        });
                    }else{
                        response.status(403).json({
                            message:'The email is already registered'
                        });
                    }
                });
            }else{
                response.status(403).json(_error.validation);
            }
        });
    });
};

