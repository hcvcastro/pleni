'use strict';

var request=require('supertest')
  , should=require('should')
  , cheerio=require('cheerio')
  , app=require('../../server/master')
  , config=require('../../config/tests')
  , User=require('../../server/master/models/user')

describe('signin controller functions',function(){
    describe('testing for signin',function(){
        var cookie='';

        it('GET /signin',function(done){
            request(app)
                .get('/signin')
                .expect(200,done);
        });

        it('POST /signin 403',function(done){
            request(app)
                .post('/signin')
                .expect(403,done);
        });

        it('POST /signin 403',function(done){
            request(app)
                .get('/signin')
                .end(function(err,res){
                    var $=cheerio.load(res.text)
                      , csrf=$('input[name=_csrf]').val()

                    request(app)
                        .post('/signin')
                        .set('cookie',res.headers['set-cookie'])
                        .send()
                        .expect(403,done);
                });
        });

        it('POST /signin 200',function(done){
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
                          , email:config.master.email
                          , password:config.master.password
                        })
                        .expect(200)
                        .end(function(err,res){
                            cookie=res.headers['set-cookie'];
                            res.body.should.have.property('ok')
                                .and.be.eql(true);
                            done();
                        });
                });
        });

        it('POST /profile',function(done){
            request(app)
                .post('/profile')
                .set('cookie',cookie[1])
                .end(function(err,res){
                    res.body.should.have.property('id')
                        .and.eql(0);
                    res.body.should.have.property('email')
                        .and.eql(config.master.email);
                    done();
                });
        });

        it('POST /signout',function(done){
            request(app)
                .post('/signout')
                .set('cookie',cookie)
                .end(function(err,res){
                    res.body.should.have.property('ok')
                        .and.be.eql(true);
                    done();
                });
        });
    });

    describe('testing for signup',function(){
        var cookie='';

        it('GET /signup',function(done){
            request(app)
                .get('/signup')
                .expect(200,done);
        });

        it('POST /signup 403',function(done){
            request(app)
                .get('/signup')
                .end(function(err,res){
                    var $=cheerio.load(res.text)
                      , csrf=$('input[name=_csrf]').val()

                    request(app)
                        .post('/signup')
                        .set('cookie',res.headers['set-cookie'])
                        .send({
                            _csrf:csrf
                          , email:config.master.email
                          , password:config.master.password
                        })
                        .expect(403)
                        .end(function(err,res){
                            res.body.should.have.property('message')
                                .and.be.eql('The email is already registered');
                            done();
                        });
                });
        });

        it('POST /signup',function(done){
            request(app)
                .get('/signup')
                .end(function(err,res){
                    var $=cheerio.load(res.text)
                      , csrf=$('input[name=_csrf]').val()

                    request(app)
                        .post('/signup')
                        .set('cookie',res.headers['set-cookie'])
                        .send({
                            _csrf:csrf
                          , email:config.user.email
                          , password:config.user.password
                        })
                        .expect(200)
                        .end(function(err,res){
                            res.body.should.have.property('ok')
                                .and.be.true;
                            done();
                        });
                });
        });
    });

    describe('testing for confirm',function(){
        var key='';

        before(function(done){
            User.findOne({email:config.user.email},function(err,user){
                key=user.status.key;
                done();
            });
        });

        it('POST /confirm/ 404',function(done){
            request(app)
                .get('/confirm/1'+key)
                .expect('Content-Type',/html/)
                .expect(404)
                .end(function(err,res){
                    res.statusCode.should.be.eql(404);
                    done();
                });
        });

        it('POST /confirm/ 200',function(done){
            request(app)
                .get('/confirm/'+key)
                .expect(302)
                .end(function(err,res){
                    res.statusCode.should.be.eql(302);
                    res.headers.should.have.property('set-cookie');
                    done();
                });
        });
    });

    describe('testing for forgot',function(){
        it('GET /forgot',function(done){
            request(app)
                .get('/forgot')
                .expect(200,done);
        });

        it('POST /forgot',function(done){
            request(app)
                .get('/forgot')
                .end(function(err,res){
                    var $=cheerio.load(res.text)
                      , csrf=$('input[name=_csrf]').val()

                    request(app)
                        .post('/forgot')
                        .set('cookie',res.headers['set-cookie'])
                        .send({
                            _csrf:csrf
                          , email:config.user.email
                        })
                        .expect(200)
                        .end(function(err,res){
                            User.findOne({
                                email:config.user.email
                            },function(err,user){
                                user.status.type.should.be.eql('forgot');
                                done();
                            });
                        });
                });
        });
    });

    describe('testing for reset',function(){
        var key='';

        before(function(done){
            User.findOne({
                'email':config.user.email
              , 'status.type':'forgot'
            },function(err,user){
                key=user.status.key;
                done();
            });
        });

        it('POST /reset',function(done){
            request(app)
                .get('/reset')
                .end(function(err,res){
                    var $=cheerio.load(res.text)
                      , csrf=$('input[name=_csrf]').val()

                    request(app)
                        .post('/reset/'+key)
                        .set('cookie',res.headers['set-cookie'])
                        .send({
                            _csrf:csrf
                          , email:config.user.email
                          , password:config.user.password
                        })
                        .expect(200)
                        .end(function(err,res){
                            User.findOne({
                                email:config.user.email
                            },function(err,user){
                                user.status.type.should.be.eql('active');
                                done();
                            });
                        });
                });
        });
    });

    after(function(done){
        User.remove({email:config.user.email},function(err){
            if(err){
                console.log(err);
            }
            done();
        });
    });
});

