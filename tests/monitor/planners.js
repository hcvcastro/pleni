'use strict';

var request=require('supertest')
  , should=require('should')
  , cheerio=require('cheerio')
  , app=require('../../server/monitor')
  , config=require('../../config/tests')
  , Planner=require('../../server/monitor/models/planner')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error

describe('planners controller functions',function(){
    var cookie='';

    before(function(done){
        request(app)
            .get('/home')
            .end(function(err,res){
                var $=cheerio.load(res.text)
                  , csrf=$('input[name=_csrf]').val()

                request(app)
                    .post('/signin')
                    .set('cookie',res.headers['set-cookie'])
                    .send({
                        _csrf:csrf
                      , email:config.monitor.email
                      , password:config.monitor.password
                    })
                    .expect(200)
                    .end(function(err,res){
                        cookie=res.headers['set-cookie'];
                        done();
                    });
            });
    });

    [
        {test:'',expected:_error.json,status:400}
      , {test:{},expected:_error.json,status:400}
      , {test:{'':''},expected:_error.json,status:400}
      , {test:{'__':''},expected:_error.json,status:400}
      , {test:{'host':{}},expected:_error.json,status:400}
      , {test:{'host':{host:''}},expected:_error.json,status:400}
      , {test:[
          {
              id:'localhost'
            , planner:{
                  host:'localhost'
              }
          }
        ],expected:_error.json,status:400}
      , {test:[
          {
              id:'localhost'
            , planner:{
                  host:'http://127.0.0.1'
                , port:8080
              }
          }
        ],expected:_success.ok,status:201}
    ]
    .forEach(function(element){
        it('PUT /planners',function(done){
            request(app)
                .put('/planners')
                .set('cookie',cookie[1])
                .send(element.test)
                .expect('Content-Type',/json/)
                .expect(element.status)
                .end(function(err,res){
                    res.statusCode.should.be.eql(element.status);
                    res.should.be.json;
                    res.body.should.have.property('ok');
                    res.body.should.eql(element.expected);
                    done();
                });
        });
    });

    [
        {test:'',expected:_error.validation,status:403}
      , {test:{},expected:_error.validation,status:403}
      , {test:{id:1},expected:_error.validation,status:403}
      , {test:{repository:''},expected:_error.validation,status:403}
      , {test:{repository:'1'},expected:_error.validation,status:403}
      , {test:{repository:'/'},expected:_error.validation,status:403}
      , {test:{repository:'...'},expected:_error.validation,status:403}
      , {test:{
            id:'localhost'
          , planner:{
                host:'http://127.0.0.1'
              , port:8080
            }
        },expected:_error.notoverride,status:403}
    ]
    .forEach(function(element){
        it('POST /planners',function(done){
            request(app)
                .post('/planners')
                .set('cookie',cookie[1])
                .send(element.test)
                .expect('Content-Type',/json/)
                .expect(element.status)
                .end(function(err,res){
                    res.statusCode.should.be.eql(element.status);
                    res.should.be.json;
                    res.body.should.have.property('ok');
                    res.body.should.eql(element.expected);
                    done();
                });
        });
    });

    [
        {test:{
            id:'test'
          , planner:{
                host:'http://127.0.0.1'
              , port:8081
            }
        },expected:_success.ok,status:201}
      , {test:{
            id:'test2'
          , planner:{
                host:'http://127.0.0.1'
              , port:8082
            }
        },expected:_success.ok,status:201}
    ]
    .forEach(function(element){
        it('POST /planners',function(done){
            request(app)
                .post('/planners')
                .set('cookie',cookie[1])
                .send(element.test)
                .expect('Content-Type',/json/)
                .expect(element.status)
                .end(function(err,res){
                    res.statusCode.should.be.eql(element.status);
                    res.should.be.json;
                    res.body.should.have.property('id')
                       .and.have.eql(element.test.id);
                    done();
                });
        });
    });

    it('GET /planners',function(done){
        request(app)
            .get('/planners')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.an.Array;
                for(var i in res.body){
                    res.body[i].should.have.property('id');
                    res.body[i].should.have.property('planner');
                    res.body[i].planner.should.have.property('host');
                    res.body[i].planner.should.have.property('port');
                }
                done();
            });
    });

/*    after(function(done){
        Planner.remove({},function(err){
            if(!err){
                done();
            }
        });
    });*/
});

//  , redis=require('redis')
//  , redisclient=redis.createClient(
//        config.redis.port,config.redis.host,config.redis.options)
//  , planner='http://localhost:3001'
//  , task='http://localhost:3003/'

/*    before(function(done){
        redisclient.flushall(function(err,reply){
            done();
        })
    });*/
/*    it('PUT /planners',function(done){
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
    });*/

