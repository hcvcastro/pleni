'use strict';

var should=require('should')
  , base='../../../../core/tasks'
  , create=require(base+'/site/create')
  , remove=require(base+'/site/remove')
  , config=require('../../../../config/tests')
  , db_name='task_create'
  , repeat=function(){}
  , stop=function(){}

describe('testing task site/create',function(){
    it('loop 0',function(done){
        create({
            db:{
                host:config.db.host+':'+config.db.port
              , name:config.db.prefix+db_name
              , user:config.db.user
              , pass:config.db.pass
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
                host:config.db.host+':'+config.db.port
              , name:config.db.prefix+db_name
              , user:config.db.user
              , pass:config.db.pass
            }
        },repeat,stop,function(){
            done();
        });
    });
});

