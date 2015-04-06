'use strict';

var should=require('should')
  , _=require('underscore')
  , base='../../../../../../core/functions'
  , create=require(base+'/../tasks/site/create')
  , remove=require(base+'/../tasks/site/remove')
  , fetch=require(base+'/../tasks/site/fetch')
  , auth=require(base+'/databases/auth')
  , designdocument=require(base+'/repositories/sites/report/designdocument')
  , assemble=require(base+'/repositories/sites/report/assemble')
  , config=require('../../../../../../config/tests')
  , db_name='report_assemble'
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
                        auth(packet)
                        .then(designdocument)
                        .then(function(args){
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('testing design document insertion for a site',function(){
        it('designdocument function',function(done){
            assemble(packet)
            .done(function(args){
                console.log(args);
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

