'use strict';

var request=require('supertest')
  , should=require('should')
  , app=require('../../master/app')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error

describe('notifiers controller functions',function(){
    describe('notifier server basic pages',function(){
        it('GET /id',function(done){
            request(app)
                .get('/id')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.be.json;
                    res.body.should.have.property('notifier');
                    res.body.notifier.should.have.be.eql('ready for action');
                    done();
                });
        });
    });

    describe('rest functions for notifier server collections',function(){
        [
            {test:'',expected:_error.json,status:400}
          , {test:{},expected:_error.json,status:400}
          , {test:{'':''},expected:_error.json,status:400}
          , {test:{'__':''},expected:_error.json,status:400}
          , {test:{'host':{}},expected:_error.json,status:400}
          , {test:{'host':{host:''}},expected:_error.json,status:400}
          , {test:[
              {
                  planner:{
                      host:'localhost'
                  }
              }
            ],expected:_error.json,status:400}
          , {test:[
              {
                  planner:{
                      host:'http://127.0.0.1'
                    , port:3001
                  }
              }
            ],expected:_success.ok,status:201}
        ]
        .forEach(function(element){
            it('PUT /notifier',function(done){
                request(app)
                    .put('/notifier')
                    .send(element.test)
                    .expect('Content-Type',/json/)
                    .expect(element.status)
                    .end(function(err,res){
                        res.statusCode.should.be.eql(element.status);
                        res.body.should.be.json;
                        res.body.should.have.property('ok');
                        res.body.should.eql(element.expected);
                        done();
                    });
            });
        });

        it('GET /notifier',function(done){
            request(app)
                .get('/notifier')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.an.Array;
                    for(var i in res.body){
                        res.body[i].should.have.property('planner');
                        res.body[i].planner.should.have.property('host');
                        res.body[i].planner.should.have.property('port');
                    }
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
                planner:{
                    host:'http://127.0.0.1'
                  , port:3001
                }
            },expected:_error.notoverride,status:403}
        ]
        .forEach(function(element){
            it('POST /notifier',function(done){
                request(app)
                    .post('/notifier')
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
                planner:{
                    host:'http://127.0.0.1'
                  , port:8081
                }
            },expected:_success.ok,status:201}
          , {test:{
                planner:{
                    host:'http://127.0.0.1'
                  , port:8082
                }
            },expected:_success.ok,status:201}
        ]
        .forEach(function(element){
            it('POST /notifier',function(done){
                request(app)
                    .post('/notifier')
                    .send(element.test)
                    .expect('Content-Type',/json/)
                    .expect(element.status)
                    .end(function(err,res){
                        res.statusCode.should.be.eql(element.status);
                        res.should.be.json;
                        res.body.should.have.property('ok')
                        res.body.should.eql(element.expected);
                        done();
                    });
            });
        });

        it('DELETE /notifier',function(done){
            request(app)
                .delete('/notifier')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('ok');
                    res.body.should.eql(_success.ok);
                    done();
                });
        });
    });

    describe('functions for notifier server elements',function(){
        before(function(done){
            request(app)
                .put('/notifier')
                .send([{
                    id:'localhost'
                  , planner:{
                        host:'http://127.0.0.1'
                      , port:3001
                    }
                }])
                .end(function(err,res){
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
                planner:{
                    host:'http://127.0.0.1'
                  , port:3000
                }
            },id:'test',expected:_success.ok,status:201}
          , {test:{
                planner:{
                    host:'http://127.0.0.1'
                  , port:3000
                }
            },id:'test',expected:_success.ok,status:200}
        ]
        .forEach(function(element){
            it('POST /notifier/_add',function(done){
                request(app)
                    .post('/notifier/_add')
                    .send(element.test)
                    .expect('Content-Type',/json/)
                    .expect(element.status)
                    .end(function(err,res){
                        res.statusCode.should.be.eql(element.status);
                        res.body.should.be.json;
                        res.body.should.have.property('ok');
                        res.body.should.eql(element.expected);
                        done();
                    });
            });
        });

        it('POST /notifier/_remove',function(done){
            request(app)
                .post('/notifier/_remove')
                .send({
                    planner:{
                        host:'http://127.0.0.1'
                      , port:3000
                    }
                })
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('ok');
                    res.body.should.eql(_success.ok);
                    done();
                });
        });

        it('POST /notifier/_remove',function(done){
            request(app)
                .post('/notifier/_remove')
                .send({
                    planner:{
                        host:'http://127.0.0.1'
                      , port:3000
                    }
                })
                .expect('Content-Type',/json/)
                .expect(404)
                .end(function(err,res){
                    res.statusCode.should.be.eql(404);
                    res.body.should.eql(_error.notfound);
                    done();
                });
        });
    });
});

