'use strict';

var request=require('supertest')
  , should=require('should')
  , cheerio=require('cheerio')
  , app=require('../../../server/master')
  , config=require('../../../config/tests')
  , User=require('../../../server/master/models/user')
  , _success=require('../../../core/json-response').success
  , _error=require('../../../core/json-response').error

describe('notifiers controller functions',function(){
    var cookie='';

    before(function(done){
        require('../../../server/planner.io');

        User.create({
            email:config.user.email
          , password:config.user.password
          , status:{
                type:'active'
              , key:''
            }
          , resources:{
                dbservers:[]
              , repositories:[]
              , planners:[]
              , notifiers:[]
            }
          , projects:[]
        },function(err,user){
            if(!err){
                request(app)
                    .get('/signin')
                    .end(function(err,res){
                        var $=cheerio.load(res.text)
                          , csrf=$('input[name=_csrf]').val()

                        request(app)
                            .post('/signin')
                            .set('cookie',res.headers['set-cookie'])
                            .send({
                                _csrf:csrf
                              , email:config.user.email
                              , password:config.user.password
                            })
                            .end(function(err,res){
                                cookie=res.headers['set-cookie'];
                                request(app)
                                    .post('/resources/planners')
                                    .set('cookie',cookie[1])
                                    .send({
                                        id:'localhost'
                                      , planner:{
                                            host:'http://127.0.0.1'
                                          , port:3001
                                        }
                                    })
                                    .end(function(err,res){
                                        done();
                                    });
                            });
                    });
            }else{
                console.log(err);
                done();
            }
        });
    });

    it('GET /resources/view',function(done){
        request(app)
            .get('/resources/view')
            .set('cookie',cookie[1])
            .expect(200,done);
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
          , notifier:{
                host:'localhost'
            }
        }],expected:_error.json,status:400}
      , {test:[{
            id:'localhost'
          , notifier:{
                host:'http://127.0.0.1'
              , port:8080
            }
        }],expected:_success.ok,status:201}
    ]
    .forEach(function(element){
        it('PUT /resources/notifiers',function(done){
            request(app)
                .put('/resources/notifiers')
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

    it('GET /resources/notifiers',function(done){
        request(app)
            .get('/resources/notifiers')
            .set('cookie',cookie[1])
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

    it('DELETE /resources/notifiers',function(done){
        request(app)
            .delete('/resources/notifiers')
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

    it('GET /resources/notifiers',function(done){
        request(app)
            .get('/resources/notifiers')
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

    it('POST /resources/notifiers',function(done){
        request(app)
            .post('/resources/notifiers')
            .set('cookie',cookie[1])
            .send({
                id:'master'
              , notifier:{
                    host:'http://localhost'
                  , port:3000
                }
            })
            .expect('Content-Type',/json/)
            .expect(201)
            .end(function(err,res){
                res.statusCode.should.be.eql(201);
                res.should.be.json;
                res.body.should.have.property('id')
                    .and.have.eql('master');
                done();
            });
    });

    it('GET /resources/notifiers/:notifier',function(done){
        request(app)
            .get('/resources/notifiers/master')
            .set('cookie',cookie[1])
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

    it('DELETE /resources/notifiers/:notifier',function(done){
        request(app)
            .delete('/resources/notifiers/test')
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

    it('DELETE /resources/notifiers/:notifier',function(done){
        request(app)
            .delete('/resources/notifiers/test')
            .set('cookie',cookie[1])
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
            .set('cookie',cookie[1])
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
                .set('cookie',cookie[1])
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
            .set('cookie',cookie[1])
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
            .set('cookie',cookie[1])
            .send({
                server:'server'
              , planner:'localhost'
            })
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
            .set('cookie',cookie[1])
            .send({server:'server',planner:'localhost'})
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
            .set('cookie',cookie[1])
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

    after(function(done){
        User.remove({
            email:config.user.email
        },function(err){
            if(!err){
                done();
            }
        });
    });
});

