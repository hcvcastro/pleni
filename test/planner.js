'use strict';

var request=require('supertest')
  , assert=require('assert')
  , app=require('../planner/app');

describe('planner',function(){
    describe('planner functions',function(){
        it('GET /',function(done){
            request(app)
                .get('/')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    assert.equal(
                        JSON.stringify(JSON.parse(res.text)),
                        JSON.stringify(app.messages.ready)
                    );
                    done();
                });
        });

        it('POST /_run',function(done){
            request(app)
                .post('/_run')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    assert.equal(
                        JSON.stringify(JSON.parse(res.text)),
                        JSON.stringify(app.messages.run)
                    );
                    done();
                });
        });

        it('POST /_stop',function(done){
            request(app)
                .post('/_stop')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    assert.equal(
                        JSON.stringify(JSON.parse(res.text)),
                        JSON.stringify(app.messages.stop)
                    );
                    done();
                });
        });
    });
});

