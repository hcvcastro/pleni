'use strict';

var request=require('supertest')
  , should=require('should')
  , join=require('path').join
  , app=require('../../../master/app')
  , _success=require('../../../planners/utils/json-response').success
  , _error=require('../../../planners/utils/json-response').error
  , loadconfig=require('../../../master/utils/loadconfig')

describe('planners controller functions',function(){
    describe('rest functions for collection',function(){
        it('GET /resources/view',function(done){
            request(app)
                .get('/resources/view')
                .expect(200,done);
        });

        it('GET /resources/planners',function(done){
            request(app)
                .get('/resources/planners')
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
            it('PUT /resources/planners',function(done){
                request(app)
                    .put('/resources/planners')
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
            it('POST /resources/planners',function(done){
                request(app)
                    .post('/resources/planners')
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
            it('POST /resources/planners',function(done){
                request(app)
                    .post('/resources/planners')
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

        it('DELETE /resources/planners',function(done){
            request(app)
                .delete('/resources/planners')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('ok');
                    res.body.should.eql(_success.ok);
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
    });

    describe('rest function for resources',function(){
        before(function(done){
            request(app)
                .put('/resources/planners')
                .send(loadconfig(
                    join(__dirname,'..','..','..','master','config',
                        'planners.json')))
                .end(function(err,res){
                    done();
                });
        });

        it('GET /resources/planners/:planner',function(done){
            request(app)
                .get('/resources/planners/localhost')
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
                id:'test'
              , planner:{
                    host:'http://127.0.0.1'
                  , port:3001
                }
            },id:'test',status:201}
          , {test:{
                id:'test'
              , planner:{
                    host:'http://127.0.0.1'
                  , port:3001
                }
            },id:'test',status:200}
        ]
        .forEach(function(element){
            it('PUT /resources/planners/:planner',function(done){
                request(app)
                    .put('/resources/planners/'+element.id)
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
                .delete('/resources/planners/test')
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
                .delete('/resources/planners/test')
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
            {test:'test',expected:_error.notfound,status:404}
          , {test:'localhost',expected:_success.ok,status:200}
        ]
        .forEach(function(element){
            it('POST /resources/planners/:planner/_check',function(done){
                request(app)
                    .post('/resources/planners/'+element.test+'/_check')
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
                .post('/resources/planners/localhost/_status')
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
                .post('/resources/planners/localhost/_isset')
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
                .post('/resources/planners/localhost/_api')
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
                .post('/resources/planners/localhost/_get')
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
                .post('/resources/planners/localhost/_set')
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
                .post('/resources/planners/localhost/_isset')
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
                .post('/resources/planners/localhost/_get')
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
                .post('/resources/planners/localhost/_run')
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
                .post('/resources/planners/localhost/_stop')
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
                .post('/resources/planners/localhost/_unset')
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
                .post('/resources/planners/localhost/_isset')
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
                .post('/resources/planners/localhost/_tid')
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
    });
});

