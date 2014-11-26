'use strict';

var request=require('supertest')
  , should=require('should')
  , join=require('path').join
  , app=require('../../../master/app')
  , _success=require('../../../planners/utils/json-response').success
  , _error=require('../../../planners/utils/json-response').error
  , loadconfig=require('../../../master/utils/loadconfig')

describe('repositories controller functions',function(){
    describe('rest functions for collection',function(){
        it('GET /resources/view',function(done){
            request(app)
                .get('/resources/view')
                .expect(200,done);
        });

        it('GET /resources/dbservers',function(done){
            request(app)
                .get('/resources/dbservers')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.an.Array;
                    for(var i in res.body){
                        res.body[i].should.have.property('id');
                        res.body[i].should.have.property('db');
                        res.body[i].db.should.have.property('host');
                        res.body[i].db.should.have.property('port');
                        res.body[i].db.should.have.property('user');
                        res.body[i].db.should.have.property('prefix');
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
                , host:'http://localhost'
                , port:8080
                , dbuser:'boo'
                , dbpass:'boo.'
                , prefix:'p_'
              }
            ],expected:_error.json,status:400}
          , {test:[
              {
                  id:'localhost'
                , db:{
                      host:'http://localhost'
                    , port:'8080'
                    , user:'boo'
                    , pass:'boo.'
                    , prefix:'p_'
                  }
              }
            ],expected:_success.ok,status:201}
        ]
        .forEach(function(element){
            it('PUT /resources/dbservers',function(done){
                request(app)
                    .put('/resources/dbservers')
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
              , db:{
                    host:'http://localhost'
                  , port:'8080'
                  , user:'boo'
                  , pass:'boo.'
                  , prefix:'p_'
                }
            },expected:_error.notoverride,status:403}
        ]
        .forEach(function(element){
            it('POST /resources/dbservers',function(done){
                request(app)
                    .post('/resources/dbservers')
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
              , db:{
                    host:'http://localhost'
                  , port:'8080'
                  , user:'boo'
                  , pass:'boo.'
                  , prefix:'p_'
                }
            },expected:_success.ok,status:201}
        ]
        .forEach(function(element){
            it('POST /resources/dbservers',function(done){
                request(app)
                    .post('/resources/dbservers')
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

        it('DELETE /resources/dbservers',function(done){
            request(app)
                .delete('/resources/dbservers')
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
              , db:{
                    host:'http://localhost'
                  , port:'8080'
                  , user:'boo'
                  , pass:'boo.'
                }
            },expected:_error.network,status:404}
          , {test:{
                id:'test'
              , db:{
                    host:'http://localhost'
                  , port:'5984'
                  , user:'boo'
                  , pass:'boo.'
                }
            },expected:_error.auth,status:401}
          , {test :{
                id:'test'
              , db:{
                    host:'http://localhost'
                  , port:'5984'
                  , user:'jacobian'
                  , pass:'asdf'
                }
            },expected:_success.ok,status:200}
        ]
        .forEach(function(element){
            it('POST /resources/dbservers/_check',function(done){
                request(app)
                    .post('/resources/dbservers/_check')
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
                .put('/resources/dbservers')
                .send(loadconfig(
                    join(__dirname,'..','..','..','master','config',
                        'dbservers.json')))
                .end(function(err,res){
                    done();
                });
        });

        it('GET /resources/dbservers/:dbserver',function(done){
            request(app)
                .get('/resources/dbservers/main')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.db.should.have.property('host');
                    res.body.db.should.have.property('port');
                    res.body.db.should.have.property('prefix');
                    done();
                });
        });

        it('GET /resources/dbservers/:dbserver',function(done){
            request(app)
                .get('/resources/dbservers/nonexistent')
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
              , db:{
                    host:'http://localhost'
                  , port:'8080'
                  , user:'boo'
                  , pass:'boo.'
                  , prefix:'p_'
                }
            },id:'test',status:201}
          , {test:{
                id:'test'
              , db:{
                    host:'http://localhost'
                  , port:'5984'
                  , user:'admin'
                  , pass:'asdf'
                  , prefix:'p_'
                }
            },id:'test',status:200}
        ]
        .forEach(function(element){
            it('PUT /resources/dbservers/:dbserver',function(done){
                request(app)
                    .put('/resources/dbservers/'+element.id)
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

        it('DELETE /resources/dbservers/:dbserver',function(done){
            request(app)
                .delete('/resources/dbservers/test')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('ok');
                    res.body.should.eql(_success.ok);
                    done();
                });
        });

        it('DELETE /resources/dbservers/:dbserver',function(done){
            request(app)
                .delete('/resources/dbservers/test')
                .expect('Content-Type',/json/)
                .expect(404)
                .end(function(err,res){
                    res.statusCode.should.be.eql(404);
                    res.body.should.eql(_error.notfound);
                    done();
                });
        });

        [
            {test:'test',expected:_error.notfound,status:404}
          , {test:'localhost',expected:_success.ok,status:200}
        ]
        .forEach(function(element){
            it('POST /resources/dbservers/:dbserver/_check',function(done){
                request(app)
                    .post('/resources/dbservers/'+element.test+'/_check')
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

        [
            {test:'test',expected:_error.notfound,status:404}
          , {test:'localhost',status:200}
        ]
        .forEach(function(element){
            it('POST /resources/dbservers/:dbserver/_databases',function(done){
                request(app)
                    .post('/resources/dbservers/'+element.test+'/_databases')
                    .expect('Content-Type',/json/)
                    .expect(element.status)
                    .end(function(err,res){
                        res.statusCode.should.be.eql(element.status);
                        switch(res.statusCode){
                            case 401:
                            case 404:
                                res.body.should.have.property('ok');
                                res.body.should.eql(element.expected);
                                break;
                            case 200:
                                res.body.should.have.an.Array;
                                for(var i in res.body){
                                    res.body[i].should.be.property('name');
                                    res.body[i].should.be.property('type');
                                    res.body[i].should.be.property('params');
                                    res.body[i].params.should.be.
                                        property('db_name');
                                    res.body[i].params.should.be.
                                        property('doc_count');
                                    res.body[i].params.should.be.
                                        property('disk_size');
                                    res.body[i].params.should.be.
                                        property('data_size');
                                    res.body[i].params.should.be.
                                        property('update_seq')
                                }
                                break;
                        }
                        done();
                    });
            });
        });
    });
});

