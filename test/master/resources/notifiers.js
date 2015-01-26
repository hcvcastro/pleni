'use strict';

var request=require('supertest')
  , should=require('should')
  , join=require('path').join
  , app=require('../../../master/app')
  , _success=require('../../../planners/utils/json-response').success
  , _error=require('../../../planners/utils/json-response').error
  , loadconfig=require('../../../master/utils/loadconfig')

describe('notifiers controller functions',function(){
    describe('rest functions for collection',function(){
        it('GET /resources/view',function(done){
            request(app)
                .get('/resources/view')
                .expect(200,done);
        });

        it('GET /resources/notifiers',function(done){
            request(app)
                .get('/resources/notifiers')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.an.Array;
                    for(var i in res.body){
                        res.body[i].should.have.property('id');
                        res.body[i].should.have.property('notifier');
                        res.body[i].notifier.should.have.property('host');
                        res.body[i].notifier.should.have.property('port');
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
                , notifier:{
                      host:'localhost'
                  }
              }
            ],expected:_error.json,status:400}
          , {test:[
              {
                  id:'localhost'
                , notifier:{
                      host:'http://127.0.0.1'
                    , port:8080
                  }
              }
            ],expected:_success.ok,status:201}
        ]
        .forEach(function(element){
            it('PUT /resources/notifiers',function(done){
                request(app)
                    .put('/resources/notifiers')
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
              , notifier:{
                    host:'http://127.0.0.1'
                  , port:8080
                }
            },expected:_error.notoverride,status:403}
        ]
        .forEach(function(element){
            it('POST /resources/notifiers',function(done){
                request(app)
                    .post('/resources/notifiers')
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
              , notifier:{
                    host:'http://127.0.0.1'
                  , port:8081
                }
            },expected:_success.ok,status:201}
          , {test:{
                id:'test2'
              , notifier:{
                    host:'http://127.0.0.1'
                  , port:8082
                }
            },expected:_success.ok,status:201}
        ]
        .forEach(function(element){
            it('POST /resources/notifiers',function(done){
                request(app)
                    .post('/resources/notifiers')
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

        it('DELETE /resources/notifiers',function(done){
            request(app)
                .delete('/resources/notifiers')
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
              , notifier:{
                    host:'http://localhost'
                  , port:3009
                }
            },expected:_error.network,status:404}
          , {test :{
                id:'test'
              , notifier:{
                    host:'http://localhost'
                  , port:3000
                }
            },expected:_success.ok,status:200}
        ]
        .forEach(function(element){
            it('POST /resources/notifiers/_check',function(done){
                request(app)
                    .post('/resources/notifiers/_check')
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
                .put('/resources/notifiers')
                .send(loadconfig(
                    join(__dirname,'..','..','..','master','config',
                        'notifiers.json')))
                .end(function(err,res){
                    done();
                });
        });

        it('GET /resources/notifiers/:notifier',function(done){
            request(app)
                .get('/resources/notifiers/master')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.property('id');
                    res.body.should.have.property('notifier');
                    res.body.notifier.should.have.property('host');
                    res.body.notifier.should.have.property('port');
                    done();
                });
        });

        it('GET /resources/notifiers/:notifier',function(done){
            request(app)
                .get('/resources/notifiers/nonexistent')
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
              , notifier:{
                    host:'http://127.0.0.1'
                  , port:3001
                }
            },id:'test',status:201}
          , {test:{
                id:'test'
              , notifier:{
                    host:'http://127.0.0.1'
                  , port:3001
                }
            },id:'test',status:200}
        ]
        .forEach(function(element){
            it('PUT /resources/notifiers/:notifier',function(done){
                request(app)
                    .put('/resources/notifiers/'+element.id)
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

        it('DELETE /resources/notifiers/:notifier',function(done){
            request(app)
                .delete('/resources/notifiers/test')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('ok');
                    res.body.should.eql(_success.ok);
                    done();
                });
        });

        it('DELETE /resources/notifiers/:notifier',function(done){
            request(app)
                .delete('/resources/notifiers/test')
                .expect('Content-Type',/json/)
                .expect(404)
                .end(function(err,res){
                    res.statusCode.should.be.eql(404);
                    res.body.should.eql(_error.notfound);
                    done();
                });
        });

        it('GET /resources/notifiers',function(done){
            request(app)
                .get('/resources/notifiers')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.an.Array;
                    for(var i in res.body){
                        res.body[i].should.have.property('id');
                        res.body[i].should.have.property('notifier');
                        res.body[i].notifier.should.have.property('host');
                        res.body[i].notifier.should.have.property('port');
                    }
                    done();
                });
        });

        [
            {test:'test',expected:_error.notfound,status:404}
          , {test:'master',expected:_success.ok,status:200}
        ]
        .forEach(function(element){
            it('POST /resources/notifiers/:notifier/_check',function(done){
                request(app)
                    .post('/resources/notifiers/'+element.test+'/_check')
                    .expect('Content-Type',/json/)
                    .expect(element.status)
                    .end(function(err,res){
                        res.statusCode.should.be.eql(element.status);
                        if(element==404){
                            res.body.should.have.property('ok');
                            res.body.should.eql(element.expected);
                        }else if(element==200){
                            res.body.should.have.property('notifier');
                            res.body.notifier.should.have.property('host');
                            res.body.notifier.should.have.property('type');
                        }
                        done();
                    });
            });
        });

        it('POST /resources/notifiers/:notifier/_get',function(done){
            request(app)
                .post('/resources/notifiers/master/_get')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('notifier');
                    res.body.notifier.should.have.property('host');
                    res.body.notifier.should.have.property('_planners');
                    done();
                });
        });

        it('POST /resources/notifiers/:notifier/_add',function(done){
            request(app)
                .post('/resources/notifiers/master/_add')
                .send({server:'server',planner:'main'})
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('notifier');
                    res.body.notifier.should.have.property('host');
                    res.body.notifier.should.have.property('result');
                    done();
                });
        });

        it('POST /resources/notifiers/:notifier/_remove',function(done){
            request(app)
                .post('/resources/notifiers/master/_remove')
                .send({server:'server',planner:'main'})
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('notifier');
                    res.body.notifier.should.have.property('host');
                    res.body.notifier.should.have.property('result');
                    done();
                });
        });

        it('POST /resources/notifiers/:notifier/_clean',function(done){
            request(app)
                .post('/resources/notifiers/master/_clean')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('notifier');
                    res.body.notifier.should.have.property('host');
                    res.body.notifier.should.have.property('result');
                    done();
                });
        });
    });
});

