'use strict';

var request=require('supertest')
  , should=require('should')
  , server=require('../../planners/dumb')
  , app=server.app

describe('rest functions for dump server',function(){
    var tid;

    it('GET /',function(done){
        request(app)
            .get('/')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.should.be.json;
                res.body.should.be.eql({planner:'ready for action'});
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

    it('POST /_run',function(done){
        request(app)
            .post('/_run')
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

    it('POST /_stop',function(done){
        request(app)
            .post('/_stop')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.should.be.json;
                res.body.should.be.eql({status:'stopped'});
                done();
            });
    });

    it('PUT /task',function(done){
        request(app)
            .put('/task')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.should.be.json;
                res.body.should.have.property('ok').with.eql(true);
                done();
            });
    });

    it('GET /task',function(done){
        request(app)
            .get('/task')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.should.be.json;
                res.body.should.have.property('ok').with.eql(true);
                done();
            });
    });

    it('DELETE /task',function(done){
        request(app)
            .delete('/task')
            .expect('Content-Type',/json/)
            .expect(404)
            .end(function(err,res){
                res.should.be.json;
                res.body.should.have.property('ok').with.eql(true);
                done();
            });
    });
});

