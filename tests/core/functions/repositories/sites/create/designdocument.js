'use strict';

var should=require('should')
  , base='../../../../../../core/functions'
  , auth=require(base+'/databases/auth')
  , create=require(base+'/databases/create')
  , remove=require(base+'/databases/remove')
  , design=require(base+'/repositories/sites/create/designdocument')
  , config=require('../../../../../../config/tests')
  , db_name='create_rootsite'

describe('site initial scaffolding functions',function(){
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

    describe('testing create default design document',function(){
        it('design document creation',function(done){
            design({
                db:{
                    host:config.db.host+':'+config.db.port
                  , name:config.db.prefix+db_name
                }
              , auth:{
                    cookie:cookie
                }
              , site:{
                    url:config.url
                }
            })
            .done(function(args){
                args.site.should.have.property('design');
                args.site.design.should.have.property('_rev');
                done();
            });
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

