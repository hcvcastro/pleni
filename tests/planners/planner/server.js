'use strict';

var request=require('supertest')
  , should=require('should')
  , server=require('../../../planners/planner.io')
  , app=server.app

describe('rest functions for planner server',function(){
    var tid;

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
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.property('status').and.be.eql('stopped');
                done();
            });
    });

    it('GET /_api',function(done){
        request(app)
            .get('/_api')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                done();
            });
    });

    it('POST /',function(done){
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
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.property('ok').with.eql(true);
                res.body.should.have.property('tid')
                tid=res.body.tid
                done();
            });
    });

    it('GET /task',function(done){
        request(app)
            .get('/'+tid)
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.property('task');
                res.body.should.have.property('count');
                res.body.should.have.property('interval');
                done();
            });
    });

    it('POST /',function(done){
        request(app)
            .post('/')
            .send({task:'exclusive'})
            .expect('Content-Type',/json/)
            .expect(403)
            .end(function(err,res){
                res.statusCode.should.be.eql(403);
                res.should.be.json;
                res.body.should.have.property('ok').and.eql(false);
                done();
            });
    });

    it('DELETE /task',function(done){
        request(app)
            .delete('/task')
            .expect('Content-Type',/json/)
            .expect(404)
            .end(function(err,res){
                res.statusCode.should.be.eql(404);
                res.should.be.json;
                res.body.should.have.property('ok').and.eql(false);
                done();
            });
    });

    it('DELETE /:tid',function(done){
        request(app)
            .delete('/'+tid)
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.property('ok').and.eql(true);
                done();
            });
    });

    it('GET /task',function(done){
        request(app)
            .get('/task')
            .expect('Content-Type',/json/)
            .expect(404)
            .end(function(err,res){
                res.statusCode.should.be.eql(404);
                res.should.be.json;
                res.body.should.have.property('ok').and.eql(false);
                done();
            });
    });
});

