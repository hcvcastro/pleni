'use strict';

var fs=require('fs')
  , join=require('path').join
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , csurf=require('csurf')
  , csrf=csurf({cookie:true})

module.exports=function(app,config){
    var passport=app.get('passport')

    app.get('/',function(request,response){
        if(request.user){
            response.cookie('pleni.monitr.auth',JSON.stringify({
                role:'user'
            }));
        }
        if(config.env=='production'){
            response.status(200)
                .sendFile(join(__dirname,'..','..','client','index.html'));
        }else{
            response.status(200).render('dev');
        }
    });

    app.get('/id',function(request,response){
        response.status(200).json({
            monitor:'ready for action'
          , resources:{
                dbservers:true
              , planners:true
            }
        });
    });

    app.get('/home',csrf,function(request,response){
        if(request.user){
            response.cookie('pleni.monitr.auth',JSON.stringify({
                role:'user'
            }));

            if(config.env=='production'){
                response.status(200)
                    .sendFile(join(__dirname,'..','..','client','home.html'));
            }else{
                response.status(200).render('pages/home');
            }
        }else{
            response.cookie('pleni.monitr.auth',JSON.stringify({
                role:'guest'
            }));

            response.status(200).render('pages/signin',{
                csrftoken:request.csrfToken()
            });
        }
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
                        response.cookie('pleni.monitr.auth',JSON.stringify({
                            role:'user'
                        })).json(_success.ok);
                    }
                });
            }
        })(request,response,next);
    });

    app.post('/signout',function(request,response){
        if(request.isAuthenticated()){
            request.logout();
        }
        response.status(200).json(_success.ok);
    });
};

