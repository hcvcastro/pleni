'use strict';

var request=require('supertest')
  , should=require('should')
  , cheerio=require('cheerio')
  , app=require('../../server/master')
  , config=require('../../config/tests')
  , User=require('../../server/master/models/user')

describe('settings controller functions',function(){
    var cookie='';

    before(function(done){
        User.create({
            email:config.user.email
          , password:config.user.password
          , status:{
                type:'active'
              , key:''
            }
          , resources:{
                dbservers:[]
              , repositories:[]
              , planners:[]
              , notifiers:[]
            }
          , projects:[]
        },function(err,user){
            if(!err){
                request(app)
                    .get('/signin')
                    .end(function(err,res){
                        var $=cheerio.load(res.text)
                          , csrf=$('input[name=_csrf]').val()

                        request(app)
                            .post('/signin')
                            .set('cookie',res.headers['set-cookie'])
                            .send({
                                _csrf:csrf
                              , email:config.user.email
                              , password:config.user.password
                            })
                            .end(function(err,res){
                                cookie=res.headers['set-cookie'];
                                done();
                            });
                    });
            }else{
                console.log(err);
                done();
            }
        });
    });

    it('GET /settings/view',function(done){
        request(app)
            .get('/settings/view')
            .expect(401,done);
    });

    it('GET /settings/view',function(done){
        request(app)
            .get('/settings/view')
            .set('cookie',cookie[1])
            .expect(200,done);
    });

    it('POST /change',function(done){
        request(app)
            .get('/settings/view')
            .set('cookie',cookie[1])
            .end(function(err,res){
                var $=cheerio.load(res.text)
                  , csrf=$('input[name=_csrf]').val()

                request(app)
                    .post('/change')
                    .set('cookie',cookie[1])
                    .send({
                        pass1:config.user.password
                      , pass2:'1234567890'
                      , _csrf:csrf
                    })
                    .expect('Content-Type',/json/)
                    .expect(200)
                    .end(function(err,res){
                        res.statusCode.should.be.eql(200);
                        res.should.be.json;
                        res.body.should.have.property('ok')
                            .and.be.eql(true);
                        done();
                    });
            });
    });

    after(function(done){
        User.remove({
            email:config.user.email
        },function(err){
            if(!err){
                done();
            }
        });
    });
});

