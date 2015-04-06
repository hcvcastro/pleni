'use strict';

var should=require('should')
  , base='../../../../../../core/functions'
  , create=require(base+'/../tasks/site/create')
  , remove=require(base+'/../tasks/site/remove')
  , fetch=require(base+'/../tasks/site/fetch')
  , auth=require(base+'/databases/auth')
  , check=require(base+'/repositories/sites/report/check')
  , designdocument=require(base+'/repositories/sites/report/designdocument')
  , config=require('../../../../../../config/tests')
  , db_name='report_check'
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
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('testing check action in reports functions for a site',function(){
        it('check function',function(done){
            check(packet)
            .done(function(args){
                args.site.should.have.property('report');
                args.site.report.should.have.property('check')
                    .and.be.eql(false);
                done();
            });
        });
    });

    describe('insert the design document',function(){
        it('design document function',function(done){
            designdocument(packet)
            .done(function(args){
                done();
            });
        });
    });

    describe('testing check action in reports functions for a site',function(){
        it('check function',function(done){
            check(packet)
            .done(function(args){
                args.site.should.have.property('report');
                args.site.report.should.have.property('check')
                    .and.be.eql(true);
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

