'use strict';

var request=require('supertest')
  , should=require('should')
  , server=require('../../../planners/dumb')
  , app=server.app

describe('rest functions for planner server',function(){
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

    it('PUT /task',function(done){
        request(app)
            .put('/task')
            .expect('Content-Type',/json/)
            .expect(403)
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
            .expect(404)
            .end(function(err,res){
                res.should.be.json;
                res.body.should.have.property('ok').with.eql(true);
                done();
            });
    });

    it('PUT /site_creator',function(done){
        request(app)
            .put('/site_creator')
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

