'use strict';

var request=require('supertest')
  , should=require('should')
  , app=require('../../monitor/app')
  , redis=require('redis')
  , redisclient=redis.createClient()
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , planner='http://localhost:3001'
  , task='http://localhost:3004/1'

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
                task:task
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.eql(_success.ok);

                redisclient.hget('monitor:tasks',task,
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

                redisclient.hget('monitor:tasks',task,
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
                task:task
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

