'use strict';

var request=require('supertest')
  , should=require('should')
  , app=require('../../server/monitor')
  , config=require('../../config/tests')
  , redis=require('redis')
  , redisclient=redis.createClient(
        config.redis.port,config.redis.host,config.redis.options)
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , planner='http://localhost:3001'
  , task='http://localhost:3003/'

describe('monitor controller functions',function(){
    before(function(done){
        redisclient.flushall(function(err,reply){
            done();
        })
    });

    it('GET /id',function(done){
        request(app)
            .get('/id')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.be.json;
                res.body.should.have.property('monitor')
                    .and.be.eql('ready for action');
                done();
            });
    });

    it('PUT /planners',function(done){
        request(app)
            .put('/planners')
            .send({
                planner:planner
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.eql(_success.ok);

                redisclient.sismember('monitor:planners',planner,
                function(err,reply){
                    reply.should.be.eql(1);
                    done();
                });
            });
    });

    it('PUT /planners',function(done){
        request(app)
            .put('/planners')
            .send({
                planner:planner
            })
            .expect('Content-Type',/json/)
            .expect(403)
            .end(function(err,res){
                res.statusCode.should.be.eql(403);
                res.body.should.eql(_error.notoverride);

                redisclient.sismember('monitor:planners',planner,
                function(err,reply){
                    reply.should.be.eql(1);
                    done();
                });
            });
    });

    it('PUT /tasks',function(done){
        request(app)
            .put('/tasks')
            .send({
                task:task+'01'
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('msg')
                    .and.be.eql('Available planner found');
                res.body.should.have.property('queue')
                    .and.be.eql(0);

                redisclient.hget('monitor:tasks',task+'01',
                function(err,reply){
                    reply.should.be.eql(planner);
                    done();
                });
            });
    });

    it('DELETE /planners',function(done){
        request(app)
            .delete('/planners')
            .send({
                planner:planner
            })
            .expect('Content-Type',/json/)
            .expect(403)
            .end(function(err,res){
                res.statusCode.should.be.eql(403);
                res.body.should.eql(_error.busy);

                redisclient.hget('monitor:tasks',task+'01',
                function(err,reply){
                    reply.should.be.eql(planner);
                    done();
                });
            });
    });

    it('DELETE /tasks',function(done){
        request(app)
            .delete('/tasks')
            .send({
                task:task+'01'
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.eql(_success.ok);

                redisclient.sismember('monitor:free',planner,
                function(err,reply){
                    reply.should.be.eql(1);
                    done();
                });
            });
    });

    it('PUT /tasks',function(done){
        request(app)
            .put('/tasks')
            .send({
                task:task+'01'
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('msg')
                    .and.be.eql('Available planner found');
                res.body.should.have.property('queue')
                    .and.be.eql(0);

                redisclient.hget('monitor:tasks',task+'01',
                function(err,reply){
                    reply.should.be.eql(planner);
                    done();
                });
            });
    });

    it('PUT /tasks',function(done){
        request(app)
            .put('/tasks')
            .send({
                task:task+'02'
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('msg')
                    .and.be.eql('Waiting for an available planner');
                res.body.should.have.property('queue')
                    .and.be.eql(1);

                redisclient.zrange('monitor:queue',0,-1,
                function(err,reply){
                    reply.should.lengthOf(1);
                    reply[0].should.eql(task+'02');
                    done();
                });
            });
    });

    it('PUT /tasks',function(done){
        request(app)
            .put('/tasks')
            .send({
                task:task+'03'
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('msg')
                    .and.be.eql('Waiting for an available planner');
                res.body.should.have.property('queue')
                    .and.be.eql(2);

                redisclient.zrange('monitor:queue',0,-1,
                function(err,reply){
                    reply.should.lengthOf(2);
                    reply[0].should.eql(task+'02');
                    reply[1].should.eql(task+'03');
                    done();
                });
            });
    });

    it('PUT /tasks',function(done){
        request(app)
            .put('/tasks')
            .send({
                task:task+'04'
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('msg')
                    .and.be.eql('Waiting for an available planner');
                res.body.should.have.property('queue')
                    .and.be.eql(3);

                redisclient.zrange('monitor:queue',0,-1,
                function(err,reply){
                    reply.should.lengthOf(3);
                    reply[0].should.eql(task+'02');
                    reply[1].should.eql(task+'03');
                    reply[2].should.eql(task+'04');
                    done();
                });
            });
    });

    it('DELETE /tasks',function(done){
        request(app)
            .delete('/tasks')
            .send({
                task:task+'01'
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.eql(_success.ok);

                redisclient.hget('monitor:tasks',task+'02',
                function(err,reply){
                    reply.should.be.eql(planner);

                    redisclient.zrange('monitor:queue',0,-1,
                    function(err,reply){
                        reply.should.lengthOf(2);
                        reply[0].should.eql(task+'03');
                        reply[1].should.eql(task+'04');
                        done();
                    });
                });
            });
    });

    it('DELETE /tasks',function(done){
        request(app)
            .delete('/tasks')
            .send({
                task:task+'04'
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.eql(_success.ok);

                redisclient.hget('monitor:tasks',task+'02',
                function(err,reply){
                    reply.should.be.eql(planner);

                    redisclient.zrange('monitor:queue',0,-1,
                    function(err,reply){
                        reply.should.lengthOf(1);
                        reply[0].should.eql(task+'03');
                        done();
                    });
                });
            });
    });

    it('DELETE /tasks',function(done){
        request(app)
            .delete('/tasks')
            .send({
                task:task+'02'
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.eql(_success.ok);

                redisclient.hget('monitor:tasks',task+'03',
                function(err,reply){
                    reply.should.be.eql(planner);

                    redisclient.zrange('monitor:queue',0,-1,
                    function(err,reply){
                        reply.should.lengthOf(0);
                        done();
                    });
                });
            });
    });

    it('DELETE /tasks',function(done){
        request(app)
            .delete('/tasks')
            .send({
                task:task+'03'
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.eql(_success.ok);

                redisclient.hget('monitor:tasks',task+'03',
                function(err,reply){
                    res.statusCode.should.be.eql(200);
                    res.body.should.eql(_success.ok);

                    redisclient.sismember('monitor:free',planner,
                    function(err,reply){
                        reply.should.be.eql(1);
                        done();
                    });
                });
            });
    });

    it('DELETE /planners',function(done){
        request(app)
            .delete('/planners')
            .send({
                planner:planner
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.eql(_success.ok);
                done();
            });
    });
});

