'use strict';

var request=require('supertest')
  , should=require('should')
  , join=require('path').join
  , app=require('../../server/master')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , loadconfig=require('../../core/loadconfig')

describe('projects controller functions',function(){
    describe('rest functions for collection',function(){
        it('GET /projects/view',function(done){
            request(app)
                .get('/projects/view')
                .expect(200,done);
        });

        it('GET /projects',function(done){
            request(app)
                .get('/projects')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.an.Array;
                    for(var i in res.body){
                        res.body[i].should.have.property('id').and.be.String;
                        res.body[i].should.have.property('_repositories')
                            .and.be.Array;
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
                , _repositories:'localhost'
              }
            ],expected:_error.json,status:400}
          , {test:[
              {
                  id:'localhost'
                , _repositories:['localhost','test']
              }
            ],expected:_success.ok,status:201}
        ]
        .forEach(function(element){
            it('PUT /projects',function(done){
                request(app)
                    .put('/projects')
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
              , _repositories:['localhost']
            },expected:_error.notoverride,status:403}
        ]
        .forEach(function(element){
            it('POST /projects',function(done){
                request(app)
                    .post('/projects')
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
              , _repositories:['localhost']
            },expected:_success.ok,status:201}
          , {test:{
                id:'test2'
              , _repositories:['localhost']
            },expected:_success.ok,status:201}
        ]
        .forEach(function(element){
            it('POST /projects',function(done){
                request(app)
                    .post('/projects')
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

        it('DELETE /projects',function(done){
            request(app)
                .delete('/projects')
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

    describe('rest function for projects',function(){
        before(function(done){
            request(app)
                .put('/projects')
                .send(loadconfig(
                    join(__dirname,'..','..','config',
                        'projects.json')))
                .end(function(err,res){
                    done();
                });
        });

        it('GET /projects/:project',function(done){
            request(app)
                .get('/projects/test')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.property('id').and.be.String;
                    res.body.should.have.property('_repositories')
                        .and.be.Array;
                    done();
                });
        });

        it('GET /projects/:project',function(done){
            request(app)
                .get('/projects/nonexistent')
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
              , _repositories:['localhost']
            },id:'test2',status:201}
          , {test:{
                id:'test2'
              , _repositories:['remotehost']
            },id:'test2',status:200}
        ]
        .forEach(function(element){
            it('PUT /projects/:project',function(done){
                request(app)
                    .put('/projects/'+element.id)
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

        it('DELETE /projects/:project',function(done){
            request(app)
                .delete('/projects/test2')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('ok');
                    res.body.should.eql(_success.ok);
                    done();
                });
        });

        it('DELETE /projects/:project',function(done){
            request(app)
                .delete('/projects/test2')
                .expect('Content-Type',/json/)
                .expect(404)
                .end(function(err,res){
                    res.statusCode.should.be.eql(404);
                    res.body.should.eql(_error.notfound);
                    done();
                });
        });

        it('GET /projects',function(done){
            request(app)
                .get('/projects')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.an.Array;
                    for(var i in res.body){
                        res.body[i].should.have.property('id').and.be.String;
                        res.body[i].should.have.property('_repositories')
                            .and.be.Array;
                    }
                    done();
                });
        });
    });
});

