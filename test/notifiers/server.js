'use strict';

var request=require('supertest')
  , should=require('should')
  , app=require('../../notifiers/notifier')

describe('rest functions for notifier server',function(){
    it('GET /notifier',function(done){
        request(app)
            .get('/notifier')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.be.json;
                res.body.should.have.property('notifier');
                res.body.notifier.should.have.be.eql('ready for action');
                done();
            });
    });

    it('GET /msg.html',function(done){
        request(app)
            .get('/msg.html')
            .expect('Content-Type',/text\/html/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                done();
            });
    });

    it('PORT /notifier',function(done){
        request(app)
            .post('/notifier')
            .send({
                id:'localhost'
              , planner:{
                    host:'http://localhost'
                  , port:3001
                }
            })
            .expect('Content-Type',/json/)
            .expect(201)
            .end(function(err,res){
                res.statusCode.should.be.eql(201);
                res.body.should.be.json;
                res.body.should.have.property('ok').and.eql(true);
                done();
            });
    });
});

