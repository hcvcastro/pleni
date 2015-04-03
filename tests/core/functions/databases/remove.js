'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , auth=require(base+'/databases/auth')
  , create=require(base+'/databases/create')
  , remove=require(base+'/databases/remove')
  , config=require('../../../../config/tests')
  , db_name='function_remove'

describe('testing delete of database',function(){
    var cookie;

    before(function(done){
        auth({
            db:{
                host:config.db.host+':'+config.db.port
              , user:config.db.user
              , pass:config.db.pass
            }
        })
        .then(function(args){
            cookie=args.auth.cookie
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
    });

    it('couchdb delete database success',function(done){
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

