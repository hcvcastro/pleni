'use strict';

var request=require('supertest')
  , should=require('should')
  , server=require('../../planners/dumb')
  , app=server.app

describe('basic express server',function(){
    describe('rest functions',function(){
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
                    res.body.should.have.property('tid');
                    tid=res.body.tid;
                    done();
                });
        });

/*        it('GET /task',function(done){
            request(app)
                .get('/task')
                .expect('Content-Type',/json/)
                .expect(404)
                .end(function(err,res){
                    res.should.be.json;
                    res.body.should.be.eql({ok:false});
                    done();
                });
        });

        it('GET /:tid',function(done){
            request(app)
                .get('/'+tid)
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.should.be.json;
                    res.body.should.have.property('ok').with.eql(true);
                    res.body.should.have.property('task');
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
                    res.body.should.be.eql({ok:false});
                    done();
                });
        });

        it('PUT /newtask',function(done){
            request(app)
                .put('/newtask')
                .expect('Content-Type',/json/)
                .expect(403)
                .end(function(err,res){
                    res.should.be.json;
                    res.body.should.have.property('ok').with.eql(false);
                    res.body.should.have.not.property('tid');
                    done();
                });
        });

        it('DELETE /:tid',function(done){
            request(app)
                .delete('/'+tid)
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.should.be.json;
                    res.body.should.be.eql({ok:true});
                    done();
                });
        });

        it('PUT /newtask',function(done){
            request(app)
                .put('/newtask')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.should.be.json;
                    res.body.should.have.property('ok').with.eql(true);
                    res.body.should.have.property('tid');
                    done();
                });
        });*/
    });
});

