'use strict';

var request=require('supertest')
  , should=require('should')
  , cheerio=require('cheerio')
  , app=require('../../../../server/monitor')
  , base='../../../../core/tasks'
  , create=require(base+'/site/create')
  , remove=require(base+'/site/remove')
  , fetch=require(base+'/site/fetch')
  , summarize=require(base+'/site/summarize')
  , config=require('../../../../config/tests')
  , db_name='task_summarize'
  , repeat=function(){}
  , stop=function(){}

describe('testing task site/summarize',function(){
    var cookie=undefined
      , packet={
            db:{
                host:config.monitor.url+':'+config.monitor.port+'/dbserver'
              , name:config.db.prefix+db_name
              , user:'test'
              , pass:''
            }
          , debug:true
        }

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
                                packet.db.pass=res.body.key;
                                done();
                            });
                    });
            });
    });

    before(function(done){
        create({
            db:packet.db
          , site:{
                url:config.url
            }
        },repeat,stop,function(){
            fetch(packet,repeat,stop,function(params){
                fetch(packet,repeat,stop,function(params){
                    fetch(packet,repeat,stop,function(params){
                        done();
                    });
                });
            });
        });
    });

    it('loop 0',function(done){
        summarize({
            db:packet.db
        },repeat,stop,function(params){
            params.should.have.an.Object;
            params.should.have.property('action')
                .and.be.eql('task');
            params.should.have.property('task')
            params.task.should.have.property('id')
                .and.be.eql('site/summarize');
            params.task.should.have.property('msg')
                .and.be.eql('site repository summarized ('
                    +config.db.prefix+db_name+')');
            done();
        });
    });

    after(function(done){
        remove({
            db:packet.db
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
});

