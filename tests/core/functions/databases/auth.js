'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , auth=require(base+'/databases/auth')
  , config=require('../../../../config/tests')

describe('testing couchdb authentification',function(){
    it('couchdb authentification success',function(done){
        auth({
            db:{
                host:config.db.host+':'+config.db.port
              , user:config.db.user
              , pass:config.db.pass
            }
        })
        .done(function(args){
            args.should.have.property('auth');
            args.auth.should.have.property('cookie')
                .with.match(/^AuthSession=.*$/);
            done();
        });
    });
    it('couchdb authentification error',function(done){
        auth({
            db:{
                host:config.db.host+':'+config.db.port
              , user:config.db.user
              , pass:config.db.pass+'0'
            }
        })
        .fail(function(error){
            error.should.have.property('error')
                 .with.equal('unauthorized');
            done();
        });
    });
});

