'use strict';

var should=require('should')
  , base='../../../../../../core/functions'
  , create=require(base+'/../tasks/site/create')
  , remove=require(base+'/../tasks/site/remove')
  , fetch=require(base+'/../tasks/site/fetch')
  , auth=require(base+'/databases/auth')
  , timestamp=require(base+'/repositories/sites/summarize/gettimestampdocument')
  , config=require('../../../../../../config/tests')
  , db_name='summarize_gettimestampdocument'
  , repeat=function(){}
  , stop=function(){}

describe('site fetcher pages functions',function(){
    var packet={
        db:{
            host:config.db.host+':'+config.db.port
          , name:config.db.prefix+db_name
          , user:config.db.user
          , pass:config.db.pass
        }
    };

    before(function(done){
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
                        auth(packet)
                        .then(function(args){
                            packet=args;
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('testing for get timestatmp document for a site',function(){
        it('timestamp site',function(done){
            timestamp(packet)
            .done(function(args){
                args.task.should.have.property('timestamp');
                args.task.timestamp.should.have.property('min');
                args.task.timestamp.should.have.property('max');
                args.task.timestamp.should.have.property('count');
                done();
            });
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

