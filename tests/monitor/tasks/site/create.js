'use strict';

var request=require('supertest')
  , should=require('should')
  , cheerio=require('cheerio')
  , redis=require('redis')
  , app=require('../../../../server/monitor')
  , base='../../../../core/tasks'
  , create=require(base+'/site/create')
  , remove=require(base+'/site/remove')
  , config=require('../../../../config/tests')
  , db_name='task_create'
  , repeat=function(){}
  , stop=function(){}

describe('testing task site/create',function(){
    var cookie=undefined
      , dbuser='test'
      , apikey=undefined
      , redisclient=redis.createClient(
        config.redis.port,config.redis.host,config.redis.options)
    redisclient.on('error',console.error.bind(console,'redis connection error:'));
    redisclient.on('ready',function(){
        console.log('connection to redis db:',
            config.redis.host,':',config.redis.port);
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

                        request(app)
                            .post('/resources/apps')
                            .set('cookie',cookie[1])
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

    it('loop 0',function(done){
        create({
            db:{
                host:config.monitor.url+':'+config.monitor.port+'/dbserver'
              , name:config.db.prefix+db_name
              , user:dbuser
              , pass:apikey
            }
          , site:{
                url:config.url
            }
        },repeat,stop,function(params){
            params.should.have.an.Object;
            params.should.have.property('action')
                .and.be.eql('task');
            params.should.have.property('task')
            params.task.should.have.property('id')
                .and.be.eql('site/create');
            params.task.should.have.property('msg')
                .and.be.eql('site repository created ('
                    +config.db.prefix+db_name+')');
            done();
        });
    });

    after(function(done){
        remove({
            db:{
                host:config.monitor.url+':'+config.monitor.port+'/dbserver'
              , name:config.db.prefix+db_name
              , user:dbuser
              , pass:apikey
            }
        },repeat,stop,function(){
            done();
        });
    });

    after(function(done){
        request(app)
            .delete('/resources/apps/test')
            .set('cookie',cookie[1])
            .end(function(err,res){
                done();
            });
    });

    after(function(done){
        redisclient.flushall(function(err,reply){
            done();
        });
    });
});

