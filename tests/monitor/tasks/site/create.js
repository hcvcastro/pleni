'use strict';

var request=require('supertest')
  , should=require('should')
  , cheerio=require('cheerio')
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

    before(function(done){
        setTimeout(done,4000);
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
            console.log('test params',params);
            /*params.should.have.property('action')
                .and.be.eql('task');
            params.should.have.property('task')
            params.task.should.have.property('id')
                .and.be.eql('site/create');
            params.task.should.have.property('msg')
                .and.be.eql('site repository created ('
                    +config.db.prefix+db_name+')');*/
            done();
        });
    });

    after(function(done){
        console.log('1');
        remove({
            db:{
                host:config.monitor.url+':'+config.monitor.port+'/dbserver'
              , name:config.db.prefix+db_name
              , user:dbuser
              , pass:apikey
            }
        },repeat,stop,function(){
        console.log('2');
            done();
        });
    });

    after(function(done){
        console.log('3');
        request(app)
            .delete('/resources/apps/test')
            .set('cookie',cookie[1])
            .end(function(err,res){
        console.log('4');
                done();
            });
    });
});

