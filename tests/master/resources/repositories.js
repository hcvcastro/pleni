'use strict';

var request=require('supertest')
  , should=require('should')
  , cheerio=require('cheerio')
  , join=require('path').join
  , app=require('../../../server/master')
  , config=require('../../../config/tests')
  , User=require('../../../server/master/models/user')
  , _success=require('../../../core/json-response').success
  , _error=require('../../../core/json-response').error

describe('repositories controller functions',function(){
    var cookie='';

    before(function(done){
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
                                    .post('/resources/dbservers')
                                    .set('cookie',cookie[1])
                                    .send({
                                        id:'test'
                                      , db:{
                                            host:config.db.host
                                          , port:config.db.port
                                          , user:config.db.user
                                          , pass:config.db.pass
                                          , prefix:config.db.prefix
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

    it('GET /resources/repositories',function(done){
        request(app)
            .get('/resources/repositories')
            .set('cookie',cookie[1])
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

    it('DELETE /resources/repositories',function(done){
        request(app)
            .delete('/resources/repositories')
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

    it('GET /resources/repositories',function(done){
        request(app)
            .get('/resources/repositories')
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
          , _dbserver:'test'
          , db:{
                name:'pleni_test'
            }
        },expected:_error.network,status:404}
      , {test :{
            id:'test'
          , _dbserver:'test'
          , db:{
                name:config.couchdb.name
            }
        },expected:_success.ok,status:200}
    ]
    .forEach(function(element){
        it('POST /resources/repositories/_check',function(done){
            request(app)
                .post('/resources/repositories/_check')
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

    it('POST /resources/repositories',function(done){
        request(app)
            .post('/resources/repositories')
            .set('cookie',cookie[1])
            .send({
                id:'test'
              , _dbserver:'test'
              , db:{
                    name:config.couchdb.name
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

    it('GET /resources/repositories/:repository',function(done){
        request(app)
            .get('/resources/repositories/test')
            .set('cookie',cookie[1])
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

    it('DELETE /resources/repositories/:repository',function(done){
        request(app)
            .delete('/resources/repositories/test2')
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

    it('DELETE /resources/repositories/:repository',function(done){
        request(app)
            .delete('/resources/repositories/test2')
            .set('cookie',cookie[1])
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
            .set('cookie',cookie[1])
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
                .set('cookie',cookie[1])
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

