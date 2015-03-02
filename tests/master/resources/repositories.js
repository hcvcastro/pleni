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

        it('GET /resources/repositories',function(done){
            request(app)
                .get('/resources/repositories')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.an.Array;
                    for(var i in res.body){
                        res.body[i].should.have.property('id');
                        res.body[i].should.have.property('_dbserver');
                        res.body[i].should.have.property('db');
                        res.body[i].db.should.have.property('name');
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
                , dbserver:'localhost'
                , name:'pleni_site_test'
              }
            ],expected:_error.json,status:400}
          , {test:[
              {
                  id:'localhost'
                , _dbserver:'localhost'
                , db:{
                      name:'pleni_site_test'
                  }
              }
            ],expected:_success.ok,status:201}
        ]
        .forEach(function(element){
            it('PUT /resources/repositories',function(done){
                request(app)
                    .put('/resources/repositories')
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
              , _dbserver:'localhost'
              , db:{
                    name:'pleni_test'
                }
            },expected:_error.notoverride,status:403}
        ]
        .forEach(function(element){
            it('POST /resources/repositories',function(done){
                request(app)
                    .post('/resources/repositories')
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
              , _dbserver:'localhost'
              , db:{
                    name:'pleni_test'
                }
            },expected:_success.ok,status:201}
          , {test:{
                id:'test2'
              , _dbserver:'localhost'
              , db:{
                    name:'pleni_test'
                }
            },expected:_success.ok,status:201}
        ]
        .forEach(function(element){
            it('POST /resources/repositories',function(done){
                request(app)
                    .post('/resources/repositories')
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

        it('DELETE /resources/repositories',function(done){
            request(app)
                .delete('/resources/repositories')
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
              , _dbserver:'localhost'
              , db:{
                    name:'pleni_test'
                }
            },expected:_error.network,status:404}
          , {test :{
                id:'test'
              , _dbserver:'localhost'
              , db:{
                    name:'db_test'
                }
            },expected:_success.ok,status:200}
        ]
        .forEach(function(element){
            it('POST /resources/repositories/_check',function(done){
                request(app)
                    .post('/resources/repositories/_check')
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
                .put('/resources/repositories')
                .send(loadconfig(
                    join(__dirname,'..','..','..','master','config',
                        'repositories.json')))
                .end(function(err,res){
                    done();
                });
        });

        it('GET /resources/repositories/:repository',function(done){
            request(app)
                .get('/resources/repositories/test')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.property('id');
                    res.body.should.have.property('_dbserver');
                    res.body.should.have.property('db');
                    res.body.db.should.have.property('name');
                    done();
                });
        });

        it('GET /resources/repositories/:repository',function(done){
            request(app)
                .get('/resources/repositories/nonexistent')
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
              , _dbserver:'localhost'
              , db:{
                    name:'db_test'
                }
            },id:'test2',status:201}
          , {test:{
                id:'test2'
              , _dbserver:'localhost'
              , db:{
                    name:'db_test'
                }
            },id:'test2',status:200}
        ]
        .forEach(function(element){
            it('PUT /resources/repositories/:repository',function(done){
                request(app)
                    .put('/resources/repositories/'+element.id)
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

        it('DELETE /resources/repositories/:repository',function(done){
            request(app)
                .delete('/resources/repositories/test2')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('ok');
                    res.body.should.eql(_success.ok);
                    done();
                });
        });

        it('DELETE /resources/repositories/:repository',function(done){
            request(app)
                .delete('/resources/repositories/test2')
                .expect('Content-Type',/json/)
                .expect(404)
                .end(function(err,res){
                    res.statusCode.should.be.eql(404);
                    res.body.should.eql(_error.notfound);
                    done();
                });
        });

        it('GET /resources/repositories',function(done){
            request(app)
                .get('/resources/repositories')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.an.Array;
                    for(var i in res.body){
                        res.body[i].should.have.property('id');
                        res.body[i].should.have.property('_dbserver');
                        res.body[i].should.have.property('db');
                        res.body[i].db.should.have.property('name');
                    }
                    done();
                });
        });

        [
            {test:'test2',expected:_error.notfound,status:404}
          , {test:'test',expected:_success.ok,status:200}
        ]
        .forEach(function(element){
            it('POST /resources/repositories/:repository/_check',function(done){
                request(app)
                    .post('/resources/repositories/'+element.test+'/_check')
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
});
