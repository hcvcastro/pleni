'use strict';

var request=require('supertest')
  , should=require('should')
  , server=require('../../../planners/planner')
  , app=server.app

describe('tasks functions for planner scheduler',function(){
    var tid;

    before(function(done){
        request(app)
            .post('/')
            .send({
                task:'exclusive'
              , count: 1
              , interval: 1000
            })
            .expect('Content-Type',/json/)
            .expect(403)
            .end(function(err,res){
                tid=res.body.tid
                done();
            });
    });

    it('POST /:tid/_run',function(done){
        request(app)
            .post('/'+tid+'/_run')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.property('status');
                res.body.status.should.be.eql('running');
                done();
            });
    });

    it('GET /_status',function(done){
        request(app)
            .get('/_status')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.property('status');
                res.body.status.should.be.eql('running');
                done();
            });
    });

    it('POST /:tid/_stop',function(done){
        request(app)
            .post('/'+tid+'/_stop')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.property('status');
                res.body.status.should.be.eql('stopped');
                done();
            });
    });

    it('GET /_status',function(done){
        request(app)
            .get('/_status')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.property('status');
                res.body.status.should.be.eql('stopped');
                done();
            });
    });
});

