'use strict';

var should=require('should')
  , base='../../../../core/tasks'
  , create=require(base+'/site/create')
  , remove=require(base+'/site/remove')
  , fetch=require(base+'/site/fetch')
  , report=require(base+'/site/report')
  , config=require('../../../../config/tests')
  , db_name='task_report'
  , repeat=function(){}
  , stop=function(){}

describe('testing task site/report',function(){
    before(function(done){
        var packet={
            db:{
                host:config.db.host+':'+config.db.port
              , name:config.db.prefix+db_name
              , user:config.db.user
              , pass:config.db.pass
            }
        };

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
        },repeat,stop,function(){
            fetch(packet,repeat,stop,function(params){
                fetch(packet,repeat,stop,function(params){
                    fetch(packet,repeat,stop,function(params){
                        fetch(packet,repeat,stop,function(params){
                            fetch(packet,repeat,stop,function(params){
                                fetch(packet,repeat,stop,function(params){
                                    fetch(packet,repeat,stop,function(params){
                                fetch(packet,repeat,stop,function(params){
                            fetch(packet,repeat,stop,function(params){
                        fetch(packet,repeat,stop,function(params){
                    fetch(packet,repeat,stop,function(params){
                done();
                    });
                        });
                            });
                                });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it('loop 0',function(done){
        report({
            db:{
                host:config.db.host+':'+config.db.port
              , name:config.db.prefix+db_name
              , user:config.db.user
              , pass:config.db.pass
            }
        },repeat,stop,function(params){
//           params.should.have.an.Object;
//           params.should.have.property('action')
//               .and.be.eql('task');
//           params.should.have.property('task')
//           params.task.should.have.property('id')
//               .and.be.eql('site/summarize');
//           params.task.should.have.property('msg')
//               .and.be.eql('site repository summarized ('
//                   +config.db.prefix+db_name+')');
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

