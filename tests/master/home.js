'use strict';

var request=require('supertest')
  , should=require('should')
  , app=require('../../server/master')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error

describe('home controller functions',function(){
    it('GET /',function(done){
        request(app)
            .get('/')
            .expect('Content-Type',/html/)
            .expect(200,done);
    });

    it('GET /home',function(done){
        request(app)
            .get('/home')
            .expect('Content-Type',/html/)
            .expect(200,done);
    });

    it('GET /static/notfound',function(done){
        request(app)
            .get('/static/notfound')
            .expect('Content-Type',/json/)
            .expect(404)
            .end(function(err,res){
                res.statusCode.should.be.eql(404);
                res.should.be.json;
                res.body.should.eql(_error.notfound);
                done();
            });
    });

    [
        'api'
      , 'contact'
      , 'privacy'
      , 'security'
      , 'started'
      , 'support'
      , 'terms'
    ]
    .forEach(function(element){
        it('GET /static/'+element,function(done){
            request(app)
                .get('/static/'+element)
                .expect('Content-Type',/html/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    done();
                });
        });
    });
});

