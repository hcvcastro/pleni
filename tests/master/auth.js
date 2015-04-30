'use strict';

var request=require('supertest')
  , should=require('should')
  , cheerio=require('cheerio')
  , app=require('../../server/master')

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
                      , email:'cijkb.j@gmail.com'
                      , password:'asdfqwerasdfzzxcv'
                    })
                    .expect(200,done);
//                    .end(function(err2,res2){
//                        done();
//                    });
            });
    });
});

