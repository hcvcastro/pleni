'use strict';

var request=require('supertest')
  , should=require('should')
  , server=require('../../../server/planners/dumb')
  , app=server.app

describe('rest functions for planner server',function(){
    it('GET /id',function(done){
        request(app)
            .get('/id')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.property('planner')
                    .and.be.eql('ready for action');
                done();
            });
    });

    it('GET /_status',function(done){
        request(app)
            .get('/_status')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.should.be.json;
                res.body.should.be.eql({status:'stopped'});
                done();
            });
    });

    it('GET /_api',function(done){
        request(app)
            .get('/_api')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.should.be.json;
                res.body.should.be.eql({});
                done();
            });
    });

    it('POST /:tid/_run',function(done){
        request(app)
            .post('/test/_run')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.should.be.json;
                res.body.should.be.eql({status:'running'});
                done();
            });
    });

    it('GET /_status',function(done){
        request(app)
            .get('/_status')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.should.be.json;
                res.body.should.be.eql({status:'running'});
                done();
            });
    });

    it('POST /:tid/_stop',function(done){
        request(app)
            .post('/test/_stop')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.should.be.json;
                res.body.should.be.eql({status:'stopped'});
                done();
            });
    });

    it('POST /',function(done){
        request(app)
            .post('/')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.should.be.json;
                res.body.should.have.property('ok').with.eql(true);
                done();
            });
    });
});

