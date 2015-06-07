'use strict';

var request=require('supertest')
  , should=require('should')
  , cheerio=require('cheerio')
  , redis=require('redis')
  , app=require('../../../server/monitor')
  , config=require('../../../config/tests')
  , DBServer=require('../../../server/monitor/models/dbserver')
  , _success=require('../../../core/json-response').success
  , _error=require('../../../core/json-response').error

describe('dbservers controller functions',function(){
    var cookie=''
      , redisclient=redis.createClient(
        config.redis.port,config.redis.host,config.redis.options)
    redisclient.on('error',console.error.bind(console,'redis connection error:'));
    redisclient.on('ready',function(){
        console.log('connection to redis db:',
            config.redis.host,':',config.redis.port);
    });

    before(function(done){
        redisclient.flushall(function(err,reply){
            done();
        });
    });

    before(function(done){
        request(app)
            .get('/home')
            .end(function(err,res){
                var $=cheerio.load(res.text)
                  , csrf=$('input[name=_csrf]').val()

                request(app)
                    .post('/signin')
                    .set('cookie',res.headers['set-cookie'])
                    .send({
                        _csrf:csrf
                      , email:config.monitor.email
                      , password:config.monitor.password
                    })
                    .expect(200)
                    .end(function(err,res){
                        cookie=res.headers['set-cookie'];
                        done();
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
          , type:'real'
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
      , {test:{db:''},expected:_error.validation,status:403}
      , {test:{db:'1'},expected:_error.validation,status:403}
      , {test:{db:'/'},expected:_error.validation,status:403}
      , {test:{db:'...'},expected:_error.validation,status:403}
      , {test:{
            id:'localhost'
          , type:'real'
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
          , type:'real'
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
          , type:'real'
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

    it('GET /resources/dbservers',function(done){
        request(app)
            .get('/resources/dbservers')
            .set('cookie',cookie[1])
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

    it('DELETE /resources/dbservers',function(done){
        request(app)
            .delete('/resources/dbservers')
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

    it('GET /resources/dbservers',function(done){
        request(app)
            .get('/resources/dbservers')
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
      , {test:{db:''},expected:_error.validation,status:403}
      , {test:{db:'1'},expected:_error.validation,status:403}
      , {test:{db:'/'},expected:_error.validation,status:403}
      , {test:{db:'...'},expected:_error.validation,status:403}
      , {test:{
            id:'test'
          , type:'real'
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
          , type:'real'
          , db:{
                host:'http://localhost'
              , port:5984
              , user:'boo'
              , pass:'boo.'
              , prefix:''
            }
        },expected:_error.auth,status:401}
      , {test :{
            id:'test'
          , type:'real'
          , db:config.db
        },expected:_success.ok,status:200}
    ]
    .forEach(function(element){
        it('POST /resources/dbservers/_check',function(done){
            request(app)
                .post('/resources/dbservers/_check')
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

    it('POST /resources/dbservers',function(done){
        request(app)
            .post('/resources/dbservers')
            .set('cookie',cookie[1])
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
            .set('cookie',cookie[1])
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

    it('GET /resources/dbservers',function(done){
        request(app)
            .get('/resources/dbservers')
            .set('cookie',cookie[1])
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

    after(function(done){
        DBServer.remove({},function(err){
            if(!err){
                done();
            }
        });
    });
});

