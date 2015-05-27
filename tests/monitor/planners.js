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
      , {test:[{
            id:'localhost'
          , planner:{
                host:'localhost'
            }
        }],expected:_error.json,status:400}
      , {test:[{
            id:'localhost'
          , planner:{
                host:'http://127.0.0.1'
              , port:8080
            }
        },{
            id:'localhost2'
          , planner:{
                host:'http://127.0.0.1'
              , port:8081
            }
        }],expected:_success.ok,status:201}
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

    it('DELETE /planners',function(done){
        request(app)
            .delete('/planners')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('ok');
                res.body.should.eql(_success.ok);
                done();
            });
    });
/*
    it('GET /resources/planners',function(done){
        request(app)
            .get('/resources/planners')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.an.Array.and.be.empty;
                done();
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
            id:'test'
          , planner:{
                host:'http://localhost'
              , port:3009
            }
        },expected:_error.network,status:404}
      , {test :{
            id:'test'
          , planner:{
                host:'http://localhost'
              , port:3001
            }
        },expected:_success.ok,status:200}
    ]
    .forEach(function(element){
        it('POST /resources/planners/_check',function(done){
            request(app)
                .post('/resources/planners/_check')
                .set('cookie',cookie[1])
                .send(element.test)
                .expect('Content-Type',/json/)
                .expect(element.status)
                .end(function(err,res){
                    res.statusCode.should.be.eql(element.status);
                    res.body.should.have.property('ok');
                    res.body.should.eql(element.expected);
                    done();
                });
        });
    });

    it('POST /resources/planners',function(done){
        request(app)
            .post('/resources/planners')
            .set('cookie',cookie[1])
            .send({
                id:'test'
              , planner:{
                    host:'http://127.0.0.1'
                  , port:3001
                }
            })
            .expect('Content-Type',/json/)
            .expect(201)
            .end(function(err,res){
                res.statusCode.should.be.eql(201);
                res.should.be.json;
                res.body.should.have.property('id')
                   .and.have.eql('test');
                done();
            });
    });

    it('GET /resources/planners/:planner',function(done){
        request(app)
            .get('/resources/planners/test')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.property('id');
                res.body.should.have.property('planner');
                res.body.planner.should.have.property('host');
                res.body.planner.should.have.property('port');
                done();
            });
    });

    it('GET /resources/planners/:planner',function(done){
        request(app)
            .get('/resources/planners/nonexistent')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(404)
            .end(function(err,res){
                res.statusCode.should.be.eql(404);
                res.should.be.json;
                res.body.should.eql(_error.notfound);
                done();
            });
    });

    [
      , {test:{},id:{},expected:_error.validation,status:403}
      , {test:{'':''},id:'asdf',expected:_error.validation,status:403}
      , {test:{'__':''},id:250,expected:_error.validation,status:403}
      , {test:{'host':{}},id:'asdf',expected:_error.validation,status:403}
      , {test:{'host':{host:''}},id:'asdf',
          expected:_error.validation,status:403}
      , {test:{'host':
          {host:'http://localhost'}},id:'asdf',
          expected:_error.validation,status:403}
      , {test:{
            id:'test2'
          , planner:{
                host:'http://127.0.0.1'
              , port:3001
            }
        },id:'test2',status:201}
      , {test:{
            id:'test2'
          , planner:{
                host:'http://127.0.0.1'
              , port:3001
            }
        },id:'test2',status:200}
    ]
    .forEach(function(element){
        it('PUT /resources/planners/:planner',function(done){
            request(app)
                .put('/resources/planners/'+element.id)
                .set('cookie',cookie[1])
                .send(element.test)
                .expect('Content-Type',/json/)
                .expect(element.status)
                .end(function(err,res){
                    res.statusCode.should.be.eql(element.status);
                    switch(res.statusCode){
                        case 403:
                            res.should.be.json;
                            res.body.should.have.property('ok');
                            res.body.should.eql(element.expected);
                            break;
                        case 200:
                        case 201:
                            res.should.be.json;
                            res.body.should.have.property('id')
                               .and.have.eql(element.id);
                            break;
                    }
                    done();
                });
        });
    });

    it('DELETE /resources/planners/:planner',function(done){
        request(app)
            .delete('/resources/planners/test2')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('ok');
                res.body.should.eql(_success.ok);
                done();
            });
    });

    it('DELETE /resources/planners/:planner',function(done){
        request(app)
            .delete('/resources/planners/test2')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(404)
            .end(function(err,res){
                res.statusCode.should.be.eql(404);
                res.body.should.eql(_error.notfound);
                done();
            });
    });

    it('GET /resources/planners',function(done){
        request(app)
            .get('/resources/planners')
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

    [
        {test:'test2',expected:_error.notfound,status:404}
      , {test:'test',expected:_success.ok,status:200}
    ]
    .forEach(function(element){
        it('POST /resources/planners/:planner/_check',function(done){
            request(app)
                .post('/resources/planners/'+element.test+'/_check')
                .set('cookie',cookie[1])
                .expect('Content-Type',/json/)
                .expect(element.status)
                .end(function(err,res){
                    res.statusCode.should.be.eql(element.status);
                    if(element==404){
                        res.body.should.have.property('ok');
                        res.body.should.eql(element.expected);
                    }else if(element==200){
                        res.body.should.have.property('planner');
                        res.body.planner.should.have.property('host');
                        res.body.planner.should.have.property('type');
                    }
                    done();
                });
        });
    });

    it('POST /resources/planners/:planner/_status',function(done){
        request(app)
            .post('/resources/planners/test/_status')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('planner');
                res.body.planner.should.have.property('host');
                res.body.planner.should.have.property('status')
                    .and.eql('stopped');
                done();
            });
    });

    it('POST /resources/planners/:planner/_isset',function(done){
        request(app)
            .post('/resources/planners/test/_isset')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('planner');
                res.body.planner.should.have.property('host');
                res.body.planner.should.have.property('result')
                    .and.be.false;
                done();
            });
    });

    it('POST /resources/planners/:planner/_api',function(done){
        request(app)
            .post('/resources/planners/test/_api')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('planner');
                res.body.planner.should.have.property('host');
                res.body.planner.should.have.property('tasks');
                res.body.planner.tasks.should.have.an.Array;
                done();
            });
    });

    it('GET /resources/planners/:planner/_get',function(done){
        request(app)
            .post('/resources/planners/test/_get')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(403)
            .end(function(err,res){
                res.statusCode.should.be.eql(401);
                res.body.should.have.property('ok').and.be.false;
                res.body.should.have.property('message');
                done();
            });
    });

    it('POST /resources/planners/:planner/_set',function(done){
        request(app)
            .post('/resources/planners/test/_set')
            .set('cookie',cookie[1])
            .send({
                server:'localhost'
              , task:{
                    name:'exclusive'
                  , count:-1
                  , interval:500
                }
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('planner');
                res.body.planner.should.have.property('host');
                res.body.planner.should.have.property('result')
                    .and.be.true;
                done();
            });
    });

    it('POST /resources/planners/:planner/_isset',function(done){
        request(app)
            .post('/resources/planners/test/_isset')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('planner');
                res.body.planner.should.have.property('host');
                res.body.planner.should.have.property('result')
                    .and.be.true;
                done();
            });
    });

    it('POST /resources/planners/:planner/_get',function(done){
        request(app)
            .post('/resources/planners/test/_get')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('planner');
                res.body.planner.should.have.property('host');
                res.body.planner.should.have.property('task');
                res.body.planner.task.should.have.property('name');
                res.body.planner.task.should.have.property('count');
                res.body.planner.task.should.have.property('interval');
                done();
            });
    });

    it('POST /resources/planners/:planner/_run',function(done){
        request(app)
            .post('/resources/planners/test/_run')
            .set('cookie',cookie[1])
            .send({
                server:'localhost'
              , targs:{}
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('planner');
                res.body.planner.should.have.property('host');
                res.body.planner.should.have.property('status')
                    .and.eql('running');
                done();
           });
    });

    it('POST /resources/planners/:planner/_stop',function(done){
        request(app)
            .post('/resources/planners/test/_stop')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('planner');
                res.body.planner.should.have.property('host');
                res.body.planner.should.have.property('status')
                    .and.eql('stopped');
                done();
           });
    });

    it('POST /resources/planners/:planner/_unset',function(done){
        request(app)
            .post('/resources/planners/test/_unset')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('planner');
                res.body.planner.should.have.property('host');
                res.body.planner.should.have.property('result')
                    .and.be.true;
                done();
           });
    });

    it('POST /resources/planners/:planner/_isset',function(done){
        request(app)
            .post('/resources/planners/test/_isset')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('planner');
                res.body.planner.should.have.property('host');
                res.body.planner.should.have.property('result')
                    .and.be.false;
                done();
            });
    });

    it('POST /resources/planners/:planner/_tid',function(done){
        request(app)
            .post('/resources/planners/test/_tid')
            .set('cookie',cookie[1])
            .send({
                server:'localhost'
              , tid:1024
            })
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('planner');
                res.body.planner.should.have.property('host');
                res.body.planner.should.have.property('result')
                    .and.be.true;
                done();
            });
    });
*/
    after(function(done){
        Planner.remove({},function(err){
            if(!err){
                done();
            }
        });
    });
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

