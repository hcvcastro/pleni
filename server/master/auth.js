'use strict';

var _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , join=require('path').join
  , csurf=require('csurf')
  , csrf=csurf({cookie:true})
  , nocaptcha=require('no-captcha')
  , generator=require('../../core/functions/utils/random').sync
  , mailer=require('../../core/functions/mails/send')
  , User=require('./models/user')

module.exports=function(app,config){
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
        var register=function(){
                User.findOne({email:request.body.email},function(err,user){
                    if(!user&&config.master.admin&&
                        config.master.email!==request.body.email){
                        var key=generator()
                        User.create({
                            email:request.body.email
                          , password:request.body.password
                          , status:{
                                type:'confirm'
                              , key:key
                            }
                        },function(err,user){
                            if(!err){
                                response.status(200).json(_success.ok);

                                if(config.env!=='test'){
                                    mail(key);
                                }
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
            }
          , mail=function(key){
                response.render('mail/confirm',{
                    site:config.url
                  , confirm:'/confirm/'+key
                },function(err,html){
                    mailer({
                        smtp:config.mailgun
                      , mail:{
                            from:config.email
                          , to:request.body.email
                          , subject:'Welcome to Pleni Toolkit'
                          , html:html
                          , attachments:[{
                                path:join(__dirname,'..','..','client','png'
                                    ,'logo.png')
                              , cid:'logo@pleni'
                            }]
                        }
                    })
                    .done();
                });
          };

        if(config.env==='test'){
            register();
        }else{
            captcha.verify({
                response:request.body.captcha
              , remoteip:request.connection.remoteAddress
            },function(err,res){
                if(!err){
                    register();
                }else{
                    response.status(403).json(_error.validation);
                }
            });
        }
    });

    app.get('/confirm/:key',function(request,response,next){
        if(request.params.key&&request.params.key.length===36){
            User.findOneAndUpdate({
                'status.type':'confirm'
              , 'status.key':request.params.key
            },{
                $set:{
                    'status.type':'active'
                  , 'status.ts':Date.now()
                }
            },function(err,user){
                if(!err&&user){
                    request.login(user,function(err){
                        if(err){
                            return next(err);
                        }else{
                            response.cookie('pleni.auth',JSON.stringify({
                                role:'user'
                            })).redirect('/');
                        }
                    });
                }else{
                    response.status(404).render('404');
                }
            });
        }else{
            response.status(404).render('404');
        }
    });

    app.post('/forgot',csrf,function(request,response){
        var register=function(){
                var key=generator();

                User.findOneAndUpdate({
                    email:request.body.email
                },{
                    $set:{
                        'status.type':'forgot'
                      , 'status.key':key
                      , 'status.ts':Date.now()
                    }
                },function(err,user){
                    if(!err){
                        response.status(200).json(_success.ok);

                        if(config.env!=='test'){
                            mail(key);
                        }
                    }else{
                        response.status(403).json({
                            message:'The email is not registered'
                        });
                    }
                });
            }
          , mail=function(key){
                response.render('mail/forgot',{
                    email:request.body.email
                  , site:config.url
                  , reset:'/reset/'+key
                },function(err,html){
                    mailer({
                        smtp:config.mailgun
                      , mail:{
                            from:config.email
                          , to:request.body.email
                          , subject:'Pleni password reset'
                          , html:html
                          , attachments:[{
                                path:join(__dirname,'..','..','client','png'
                                    ,'logo.png')
                              , cid:'logo@pleni'
                            }]
                        }
                    })
                    .done();
                });
            };

        if(config.env=='test'){
            register();
        }else{
            captcha.verify({
                response:request.body.captcha
              , remoteip:request.connection.remoteAddress
            },function(err,res){
                if(!err){
                    register();
                }else{
                    response.status(403).json(_error.validation);
                }
            });
        }
    });

    app.get('/reset/:key',csrf,function(request,response,next){
        if(request.params.key&&request.params.key.length===36){
            User.findOne({
                'status.type':'forgot'
              , 'status.key':request.params.key
            },function(err,user){
                if(!err&&user){
                    if((Date.parse(user.status.ts)+(24*60*60))<Date.now()){
                        response.render('pages/reset',{
                            csrftoken:request.csrfToken()
                        });
                    }else{
                        response.status(404).render('404');
                    }
                }else{
                    response.status(404).render('404');
                }
            });
        }else{
            response.status(404).render('404');
        }
    });
};

