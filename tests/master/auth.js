'use strict';

var request=require('supertest')
  , should=require('should')
  , cheerio=require('cheerio')
  , app=require('../../server/master')
  , config=require('../../config/master')

describe('signin controller functions',function(){
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
                        res.body.should.have.property('id')
                            .and.be.eql(0);
                        res.body.should.have.property('email')
                            .and.be.eql(config.master.email);
                        done();
                    });
            });
    });
});

