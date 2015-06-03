'use strict';

var request=require('supertest')
  , should=require('should')
  , cheerio=require('cheerio')
  , app=require('../../server/master')
  , config=require('../../config/tests')
  , monitor=config.monitor.url+':'+config.monitor.port
  , User=require('../../server/master/models/user')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error

describe('dbservers controller functions',function(){
    var cookie1=undefined
      , cookie2=undefined
      , dbuser=undefined
      , apikey=undefined

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
                dbuser=user.id;
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
                                cookie1=res.headers['set-cookie'];
                                done();
                            });
                    });
            }else{
                console.log(err);
                done();
            }
        });
    });

    before(function(done){
        request(monitor)
            .get('/home')
            .end(function(err,res){
                var $=cheerio.load(res.text)
                  , csrf=$('input[name=_csrf]').val()

                request(monitor)
                    .post('/signin')
                    .set('cookie',res.headers['set-cookie'])
                    .send({
                        _csrf:csrf
                      , email:config.monitor.email
                      , password:config.monitor.password
                    })
                    .expect(200)
                    .end(function(err,res){
                        cookie2=res.headers['set-cookie'];

                        request(monitor)
                            .post('/resources/clients')
                            .set('cookie',cookie2[1])
                            .send({
                                id:'test'
                            })
                            .end(function(err,res){
                                apikey=res.body.key;
                                done();
                            });
                    });
            });
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
          , host:'http://localhost'
          , port:8080
          , user:'boo'
          , pass:'boo.'
          , prefix:'p_'
        }],expected:_error.json,status:400}
      , {test:[{
            id:'localhost'
          , type:'virtual'
          , db:{
                host:'http://localhost'
              , port:8080
              , user:'boo'
              , pass:'boo.'
              , prefix:'p_'
            }
        }],expected:_success.ok,status:201}
    ]
    .forEach(function(element){
        it('PUT /resources/dbservers',function(done){
            request(app)
                .put('/resources/dbservers')
                .set('cookie',cookie1[1])
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
      , {test:{db:''},expected:_error.validation,status:403}
      , {test:{db:'1'},expected:_error.validation,status:403}
      , {test:{db:'/'},expected:_error.validation,status:403}
      , {test:{db:'...'},expected:_error.validation,status:403}
      , {test:{
            id:'localhost'
          , type:'virtual'
          , db:{
                host:'http://localhost'
              , port:8080
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
                .set('cookie',cookie1[1])
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
          , type:'virtual'
          , db:{
                host:'http://localhost'
              , port:8080
              , user:'boo'
              , pass:'boo.'
              , prefix:'p_'
            }
        },expected:_success.ok,status:201}
      , {test:{
            id:'test2'
          , type:'virtual'
          , db:{
                host:'localhost'
              , port:8080
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
                .set('cookie',cookie1[1])
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

    it('GET /resources/dbservers',function(done){
        request(app)
            .get('/resources/dbservers')
            .set('cookie',cookie1[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.an.Array;
                for(var i in res.body){
                    res.body[i].should.have.property('id');
                    res.body[i].should.have.property('type');
                    res.body[i].should.have.property('db');
                    res.body[i].db.should.have.property('host');
                    res.body[i].db.should.have.property('port');
                    res.body[i].db.should.have.property('prefix');
                }
                done();
            });
    });

    it('DELETE /resources/dbservers',function(done){
        request(app)
            .delete('/resources/dbservers')
            .set('cookie',cookie1[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('ok');
                res.body.should.eql(_success.ok);
                done();
            });
    });

    it('GET /resources/dbservers',function(done){
        request(app)
            .get('/resources/dbservers')
            .set('cookie',cookie1[1])
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
      , {test:{db:''},expected:_error.validation,status:403}
      , {test:{db:'1'},expected:_error.validation,status:403}
      , {test:{db:'/'},expected:_error.validation,status:403}
      , {test:{db:'...'},expected:_error.validation,status:403}
      , {test:{
            id:'test'
          , type:'virtual'
          , db:{
                host:'http://localhost'
              , port:8080
              , user:'boo'
              , pass:'boo.'
              , prefix:''
            }
        },expected:_error.network,status:404}
      , {test:{
            id:'test'
          , type:'virtual'
          , db:{
                host:config.monitor.url
              , port:config.monitor.port
              , user:'boo'
              , pass:'boo.'
              , prefix:''
            }
        },expected:_error.auth,status:401}
    ]
    .forEach(function(element){
        it('POST /resources/dbservers/_check',function(done){
            request(app)
                .post('/resources/dbservers/_check')
                .set('cookie',cookie1[1])
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

    /*it('POST /resources/dbservers/_check',function(done){
        request(app)
            .post('/resources/dbservers/_check')
            .set('cookie',cookie1[1])
            .send({
                id:'test'
              , type:'virtual'
              , db:{
                    host:config.monitor.url
                  , port:config.monitor.port
                  , user:dbuser
                  , pass:apikey
                  , prefix:''
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

/*
    it('POST /resources/dbservers',function(done){
        request(app)
            .post('/resources/dbservers')
            .set('cookie',cookie1[1])
            .send({
                id:'test'
              , type:'real'
              , db:{
                    host:config.db.host
                  , port:config.db.port
                  , user:config.db.user
                  , pass:config.db.pass
                  , prefix:config.db.prefix
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

    it('GET /resources/dbservers/:dbserver',function(done){
        request(app)
            .get('/resources/dbservers/test')
            .set('cookie',cookie1[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.property('id');
                res.body.should.have.property('db');
                res.body.db.should.have.property('host');
                res.body.db.should.have.property('port');
                res.body.db.should.have.property('prefix');
                done();
            });
    });

    it('GET /resources/dbservers/:dbserver',function(done){
        request(app)
            .get('/resources/dbservers/nonexistent')
            .set('cookie',cookie1[1])
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
          , type:'real'
          , db:{
                host:'http://localhost'
              , port:8080
              , user:'boo'
              , pass:'boo.'
              , prefix:'p_'
            }
        },id:'test2',status:201}
      , {test:{
            id:'test2'
          , type:'real'
          , db:{
                host:'http://localhost'
              , port:5984
              , user:'admin'
              , pass:'asdf'
              , prefix:'p_'
            }
        },id:'test2',status:200}
    ]
    .forEach(function(element){
        it('PUT /resources/dbservers/:dbserver',function(done){
            request(app)
                .put('/resources/dbservers/'+element.id)
                .set('cookie',cookie1[1])
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

    it('GET /resources/dbservers',function(done){
        request(app)
            .get('/resources/dbservers')
            .set('cookie',cookie1[1])
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
                    res.body[i].db.should.have.property('prefix');
                }
                done();
            });
    });

    [
        {test:'test3',expected:_error.notfound,status:404}
      , {test:'test2',expected:_error.auth,status:401}
      , {test:'test',expected:_success.ok,status:200}
    ]
    .forEach(function(element){
        it('POST /resources/dbservers/:dbserver/_check',function(done){
            request(app)
                .post('/resources/dbservers/'+element.test+'/_check')
                .set('cookie',cookie1[1])
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
        {test:'test3',expected:_error.notfound,status:404}
      , {test:'test2',expected:_error.auth,status:401}
      , {test:'test',status:200}
    ]
    .forEach(function(element){
        it('POST /resources/dbservers/:dbserver/_databases',function(done){
            request(app)
                .post('/resources/dbservers/'+element.test+'/_databases')
                .set('cookie',cookie1[1])
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

    it('DELETE /resources/dbservers/:dbserver',function(done){
        request(app)
            .delete('/resources/dbservers/test2')
            .set('cookie',cookie1[1])
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
            .delete('/resources/dbservers/test2')
            .set('cookie',cookie1[1])
            .expect('Content-Type',/json/)
            .expect(404)
            .end(function(err,res){
                res.statusCode.should.be.eql(404);
                res.body.should.eql(_error.notfound);
                done();
            });
    });*/

    after(function(done){
        request(monitor)
            .delete('/resources/clients/test')
            .set('cookie',cookie2[1])
            .end(function(err,res){
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

