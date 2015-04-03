'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , auth=require(base+'/databases/auth')
  , create=require(base+'/databases/create')
  , remove=require(base+'/databases/remove')
  , config=require('../../../../config/tests')
  , db_name='function_create'

describe('testing creation of database',function(){
    var cookie;

    before(function(done){
        auth({
            db:{
                host:config.db.host+':'+config.db.port
              , user:config.db.user
              , pass:config.db.pass
            }
        })
        .done(function(args){
            cookie=args.auth.cookie;
            done();
        });
    });

    it('couchdb create database success',function(done){
        create({
            db:{
                host:config.db.host+':'+config.db.port
              , name:config.db.prefix+db_name
            }
          , auth:{
                cookie:cookie
            }
        })
        .done(function(args){
            done();
        });
    });

    after(function(done){
        remove({
            db:{
                host:config.db.host+':'+config.db.port
              , name:config.db.prefix+db_name
            }
          , auth:{
                cookie:cookie
            }
        })
        .done(function(args){
            done();
        });
    });
});

