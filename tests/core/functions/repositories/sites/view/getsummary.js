'use strict';

var should=require('should')
  , base='../../../../../../core/functions'
  , create=require(base+'/../tasks/site/create')
  , remove=require(base+'/../tasks/site/remove')
  , fetch=require(base+'/../tasks/site/fetch')
  , auth=require(base+'/databases/auth')
  , timestamp=require(base+'/repositories/sites/summarize/gettimestamp')
  , getsummary=require(base+'/repositories/sites/view/getsummary')
  , config=require('../../../../../../config/tests')
  , db_name='view_getsummary'
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
                        .then(timestamp)
                        .then(function(args){
                            packet=args;
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('testing for summary reader',function(){
        it('getsummary function',function(done){
            getsummary(packet)
            .done(function(args){
                args.should.have.property('site');
                args.site.should.have.property('summary');
                args.site.summary.should.have.property('_id');
                args.site.summary.should.have.property('_rev');
                args.site.summary.should.have.property('ts_created');
                args.site.summary.should.have.property('ts_modified');
                args.site.summary.should.have.property('type');
                args.site.summary.should.have.property('url');
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

