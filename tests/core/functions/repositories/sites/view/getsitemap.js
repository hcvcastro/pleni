'use strict';

var should=require('should')
  , base='../../../../../../core/functions'
  , create=require(base+'/../tasks/site/create')
  , remove=require(base+'/../tasks/site/remove')
  , fetch=require(base+'/../tasks/site/fetch')
  , auth=require(base+'/databases/auth')
  , sitemap=require(base+'/repositories/sites/view/getsitemap')
  , config=require('../../../../../../config/tests')
  , db_name='view_getsitemap'
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

    describe('testing for sitemap reader',function(){
        it('getsitemap function',function(done){
            sitemap(packet)
            .done(function(args){
                args.should.have.property('site');
                args.site.should.have.property('sitemap');
                args.site.sitemap.should.have.property('count');
                args.site.sitemap.should.have.property('nodes').and.be.Array;
                args.site.sitemap.should.have.property('links').and.be.Array;
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

