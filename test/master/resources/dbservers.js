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
                  host:"http://localhost"
                , port:8080
                , dbuser:'boo'
                , dbpass:'boo.'
            },expected:_error.network,status:404}
          , {test:{
                  host:"http://localhost"
                , port:5984
                , dbuser:'boo'
                , dbpass:'boo.'
            },expected:_error.auth,status:401}
          , {test:{
                  host:"http://localhost"
                , port:5984
                , dbuser:'jacobian'
                , dbpass:'asdf'
            },expected:_success.ok,status:200}
        ]
        .forEach(function(element){
            it('POST /repositories/_check',function(done){
                request(app)
                    .post('/repositories/_check')
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

/*    describe('rest function for resources',function(){
        before(function(done){
            request(app)
                .put('/repositories')
                .send(loadconfig(
                    join(__dirname,'..','..','master','config',
                        'repositories.json')))
                .end(function(err,res){
                    done();
                });
        });

        it('GET /repositories/:repository',function(done){
            request(app)
                .get('/repositories/localhost')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.property('host');
                    res.body.should.have.property('port');
                    res.body.should.have.property('prefix');
                    done();
                });
        });

        it('GET /repositories/:repository',function(done){
            request(app)
                .get('/repositories/nonexistent')
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
          , {test:{"":""},id:'asdf',expected:_error.validation,status:403}
          , {test:{"__":""},id:250,expected:_error.validation,status:403}
          , {test:{"host":{}},id:'asdf',expected:_error.validation,status:403}
          , {test:{"host":{host:""}},id:'asdf',
              expected:_error.validation,status:403}
          , {test:{"host":
              {host:"http://localhost"}},id:'asdf',
              expected:_error.validation,status:403}
          , {test:{
                  host:"http://localhost"
                , port:8080
                , dbuser:'boo'
                , dbpass:'boo.'
                , prefix:'p_'
            },id:'asdf',status:201}
          , {test:{
                  host:"http://localhost"
                , port:5984
                , dbuser:'admin'
                , dbpass:'asdf'
                , prefix:'p_'
            },id:'asdf',status:200}
        ]
        .forEach(function(element){
            it('PUT /repositories/:repository',function(done){
                request(app)
                    .put('/repositories/'+element.id)
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

        it('DELETE /repositories/:repository',function(done){
            request(app)
                .delete('/repositories/asdf')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('ok');
                    res.body.should.eql(_success.ok);
                    done();
                });
        });

        it('DELETE /repositories/:repository',function(done){
            request(app)
                .delete('/repositories/asdf')
                .expect('Content-Type',/json/)
                .expect(404)
                .end(function(err,res){
                    res.statusCode.should.be.eql(404);
                    res.body.should.eql(_error.notfound);
                    done();
                });
        });

        [
            {test:'asdf',expected:_error.notfound,status:404}
          , {test:'localhost',expected:_success.ok,status:200}
        ]
        .forEach(function(element){
            it('POST /repositories/:repository/_check',function(done){
                request(app)
                    .post('/repositories/'+element.test+'/_check')
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
            {test:'asdf',expected:_error.notfound,status:404}
          , {test:'localhost',status:200}
        ]
        .forEach(function(element){
            it('POST /repositories/:repository/_databases',function(done){
                request(app)
                    .post('/repositories/'+element.test+'/_databases')
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
                                    res.body[i].should.be.property('db_name');
                                    res.body[i].should.be.property('db_type');
                                    res.body[i].should.be.property('doc_count');
                                    res.body[i].should.be.property('disk_size');
                                    res.body[i].should.be.property('data_size');
                                    res.body[i].should.be.property('update_seq')
                                }
                                break;
                        }
                        done();
                    });
            });
        });*/
    });
});

