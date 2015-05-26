'use strict';

var request=require('supertest')
  , should=require('should')
  , cheerio=require('cheerio')
  , app=require('../../server/monitor')
  , config=require('../../config/tests')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error

describe('home controller functions',function(){
    var cookie='';

    describe('testing for id',function(){
        it('GET /id',function(done){
            request(app)
                .get('/id')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.be.json;
                    res.body.should.have.property('monitor')
                        .and.be.eql('ready for action');
                    done();
                });
        });

        it('GET /',function(done){
            request(app)
                .get('/')
                .expect('Content-Type',/html/)
                .expect(200,done);
        });
    });

    describe('testing for signin',function(){
        it('GET /home 403',function(done){
            request(app)
                .get('/home')
                .end(function(err,res){
                    var $=cheerio.load(res.text)
                      , csrf=$('input[name=_csrf]').val()

                    request(app)
                        .post('/signin')
                        .set('cookie',res.header['set-cookie'])
                        .send()
                        .expect(403,done);
                });
        });

        it('POST /home 200',function(done){
            request(app)
                .get('/home')
                .end(function(err,res){
                    var $=cheerio.load(res.text)
                      , csrf=$('input[name=_csrf]').val()

                    request(app)
                        .post('/signin')
                        .set('cookie',res.headers['set-cookie'])
                        .send({
                            _csrf:csrf
                          , email:config.monitor.email
                          , password:config.monitor.password
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
    });
});

