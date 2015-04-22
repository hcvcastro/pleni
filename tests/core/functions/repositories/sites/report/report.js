'use strict';

var should=require('should')
  , _=require('underscore')
  , base='../../../../../../core/functions'
  , create=require(base+'/../tasks/site/create')
  , remove=require(base+'/../tasks/site/remove')
  , fetch=require(base+'/../tasks/site/fetch')
  , auth=require(base+'/databases/auth')
  , designdocument=require(base+'/repositories/sites/report/designdocument')
  , report=require(base+'/repositories/sites/report/report')
  , base1=base+'/repositories/sites/report'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
  , check=require(base1+'/check')
  , design=require(base1+'/designdocument')
  , headerserver=require(base1+'/header/server')
  , headerstatus=require(base1+'/header/status')
  , headercontenttype=require(base1+'/header/contenttype')
  , headerpoweredby=require(base1+'/header/poweredby')
  , bodyrels=require(base1+'/body/rels')
  , bodyrefs=require(base1+'/body/refs')
  , bodyhashes=require(base1+'/body/hashes')
  , config=require('../../../../../../config/tests')
  , db_name='report_report'
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
            fetch(_.clone(packet),repeat,stop,function(params){
                fetch(_.clone(packet),repeat,stop,function(params){
                    fetch(_.clone(packet),repeat,stop,function(params){
                        test(packet)
                        .then(auth)
                        .then(check)
                        .then(design)
                        .then(headerserver)
                        .then(headerstatus)
                        .then(headercontenttype)
                        .then(headerpoweredby)
                        .then(bodyrels)
                        .then(bodyrefs)
                        .then(bodyhashes)
                        .then(function(args){
                            packet=args;
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('testing design document insertion for a site',function(){
        it('designdocument function',function(done){
            report(packet)
            .done(function(args){
                args.should.have.property('site');
                args.site.should.have.property('report');
                args.site.report.should.have.property('check').and.be.false;
                args.site.report.should.have.property('_rev');
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

