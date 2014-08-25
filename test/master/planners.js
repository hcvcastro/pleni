'use strict';

var request=require('supertest')
  , should=require('should')
  , join=require('path').join
  , app=require('../../master/app')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , loadconfig=require('../../master/utils/loadconfig')

describe('planners controller functions',function(){
    describe('rest functions for collection',function(){
        it('GET /planners/view',function(done){
            request(app)
                .get('/planners/view')
                .expect(200,done);
        });

        it('GET /planners',function(done){
            request(app)
                .get('/planners')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.an.Array;
                    for(var i in res.body){
                        res.body[i].should.have.property('id');
                        res.body[i].should.have.property('host');
                        res.body[i].should.have.property('port');
                    }
                    done();
                });
        });

        [
            {test:'',expected:_success.ok,status:201}
          , {test:{},expected:_success.ok,status:201}
          , {test:{"":""},expected:_success.ok,status:201}
          , {test:{"__":""},expected:_success.ok,status:201}
          , {test:{"host":{}},expected:_success.ok,status:201}
          , {test:{"host":{host:""}},expected:_success.ok,status:201}
          , {test:{"host":
              {host:"http://localhost"}},
              expected:_success.ok,status:201}
          , {test:[
              {
                  id:"localhost"
                , host:"http://localhost"
                , port:8080
              }
            ],expected:_success.ok,status:201}
        ]
        .forEach(function(element){
            it('PUT /planners',function(done){
                request(app)
                    .put('/planners')
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
          , {test:{planner:''},expected:_error.validation,status:403}
          , {test:{planner:'1'},expected:_error.validation,status:403}
          , {test:{planner:'/'},expected:_error.validation,status:403}
          , {test:{planner:'...'},expected:_error.validation,status:403}
          , {test:{
                  id:"localhost"
                , host:"http://localhost"
                , port:8080
            },expected:_error.notoverride,status:403}
        ]
        .forEach(function(element){
            it('POST /planners',function(done){
                request(app)
                    .post('/planners')
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
                  id:"test"
                , host:"http://localhost"
                , port:8080
            },expected:_success.ok,status:201}
        ]
        .forEach(function(element){
            it('POST /planners',function(done){
                request(app)
                    .post('/planners')
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

        it('DELETE /planners',function(done){
            request(app)
                .delete('/planners')
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
            },expected:_error.network,status:404}
          , {test:{
                  host:"http://localhost"
                , port:5984
            },expected:_error.network,status:404}
          , {test:{
                  host:"http://localhost"
                , port:3001
            },expected:_success.ok,status:200}
        ]
        .forEach(function(element){
            it('POST /planners/_check',function(done){
                request(app)
                    .post('/planners/_check')
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
                .put('/planners')
                .send(loadconfig(
                    join(__dirname,'..','..','master','config',
                        'planners.json')))
                .end(function(err,res){
                    done();
                });
        });

        it('GET /planners/:planner',function(done){
            request(app)
                .get('/planners/localhost')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.property('host');
                    res.body.should.have.property('port');
                    done();
                });
        });

        it('GET /planners/:planner',function(done){
            request(app)
                .get('/planners/nonexistent')
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
            },id:'asdf',status:201}
          , {test:{
                  host:"http://localhost"
                , port:5984
            },id:'asdf',status:200}
        ]
        .forEach(function(element){
            it('PUT /planners/:planner',function(done){
                request(app)
                    .put('/planners/'+element.id)
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

        it('DELETE /planners/:planner',function(done){
            request(app)
                .delete('/planners/asdf')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('ok');
                    res.body.should.eql(_success.ok);
                    done();
                });
        });

        it('DELETE /planners/:planner',function(done){
            request(app)
                .delete('/planners/asdf')
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
            it('POST /planners/:planner/_check',function(done){
                request(app)
                    .post('/planners/'+element.test+'/_check')
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

        it('POST /planners/:planner/_api',function(done){
            request(app)
                .post('/planners/localhost/_api')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200)
                    res.body.should.be.an.Array;
                    for(var i=0;i<res.body.length;i++){
                        res.body[i].should.have.property('_task');
                    }
                    done();
                });
        });

        var tid;

        it('POST /planners/:planner/_set',function(done){
            request(app)
                .post('/planners/localhost/_set')
                .send({
                    name:'exclusive'
                  , count:1
                  , interval:1000
                })
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200)
                    res.body.should.have.property('ok');
                    res.body.should.eql(_success.ok);
                    tid=res.body.tid;
                    done();
                });
        });

        it('POST /planners/:planner/_run',function(done){
            request(app)
                .post('/planners/localhost/_run')
                .send({})
                .expect('Content-type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('ok');
                    res.body.should.eql(_success.ok);
                    done();
                });
        });

        it('POST /planners/:planner/_status',function(done){
            request(app)
                .post('/planners/localhost/_status')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200)
                    console.log(res.body);
                    res.body.should.have.property('host');
                    res.body.should.have.property('status');
                    done();
                });
        });

        it('POST /planners/:planner/_stop',function(done){
            request(app)
                .post('/planners/localhost/_stop')
                .send({})
                .expect('Content-type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('ok');
                    res.body.should.eql(_success.ok);
                    done();
                });
        });

        it('DELETE /planners/:planner/_remove',function(done){
            request(app)
                .delete('/planners/localhost/_remove')
                .expect('Content-type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.body.should.have.property('ok');
                    res.body.should.eql(_success.ok);
                    done();
                });
        });
    });
});

