'use strict';

var request=require('supertest')
  , should=require('should')
  , cheerio=require('cheerio')
  , app=require('../../server/master')
  , config=require('../../config/tests')
  , User=require('../../server/master/models/user')
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error

describe('workspace controller functions',function(){
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
                dbservers:[{
                    id:'localhost'
                  , db:{
                        host:config.db.host
                      , port:config.db.port
                      , user:config.db.user
                      , pass:config.db.pass
                      , prefix:config.db.prefix
                    }
                }]
              , repositories:[{
                    id:'test'
                  , _dbserver:'localhost'
                  , db:{
                        name:config.couchdb.name
                    }
                }]
              , planners:[]
              , notifiers:[]
            }
          , projects:[{
                id:'test'
              , _repositories:['test']
            }]
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
                                done();
                            });
                    });
            }else{
                console.log(err);
                done();
            }
        });
    });

    it('GET /workspace/view',function(done){
        request(app)
            .get('/workspace/view')
            .set('cookie',cookie[1])
            .expect(200,done);
    });

    it('GET /workspace/:project/:repository/summary',function(done){
        request(app)
            .get('/workspace/test/test/summary')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.property('_id');
                res.body.should.have.property('_rev');
                res.body.should.have.property('type');
                res.body.should.have.property('url');
                done();
            });
    });

    it('GET /workspace/:project/:repository/sitemap',function(done){
        request(app)
            .get('/workspace/test/test/sitemap')
            .set('cookie',cookie[1])
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                res.body.should.have.property('count');
                res.body.should.have.property('nodes').and.be.Array;
                res.body.should.have.property('links').and.be.Array;
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

