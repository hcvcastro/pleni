'use strict';

var validate=require('../../core/validators')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , csurf=require('csurf')
  , csrf=csurf({cookie:false})
  , User=require('./models/user')
  , schema=require('../../core/schema')

module.exports=function(app){
    var authed=app.get('auth');

    app.get('/settings/view',authed,csrf,function(request,response){
        response.render('pages/settings',{
            csrftoken:request.csrfToken()
        });
    });

    app.post('/change',authed,csrf,function(request,response){
        if(request.body.pass1&&request.body.pass2){
            var email=request.user.email
              , old_pass=request.body.pass1
              , new_pass=request.body.pass2

            User.findOne({
                email:email
            },function(err,user){
                if(!err){
                    user.comparePassword(old_pass,function(err,match){
                        if(match){
                            user.password=new_pass;
                            user.save(function(err){
                                if(!err){
                                    response.status(200).json(_success.ok);
                                }else{
                                    response.status(400)
                                        .json(_error.incorrectinformation);
                                }
                            });
                        }else{
                            response.status(400)
                                .json(_error.incorrectinformation);
                        }
                    });
                }else{
                    response.status(400).json(_error.invalidaccount);
                }
            });
        }else{
            response.status(400).json(_error.json);
        }
    });
};

