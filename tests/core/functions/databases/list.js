'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , auth=require(base+'/databases/auth')
  , list=require(base+'/databases/list')
  , config=require('../../../../config/tests')

describe('testing list of databases',function(){
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

    it('listing of databases',function(done){
        list({
            db:{
                host:config.db.host+':'+config.db.port
            }
          , auth:{
                cookie:cookie
            }
        })
        .done(function(args){
            args.should.be.an.Object;
            args.should.have.property('db');
            args.db.should.have.property('list');
            args.db.list.should.be.an.Array;
            done();
        });
    });
});

