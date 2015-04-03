'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , test=require(base+'/databases/test')
  , config=require('../../../../config/tests')

describe('testing couchdb server',function(){
    it('couchdb server success connection',function(done){
        test({
            db:{
                host:config.db.host+':'+config.db.port
            }
        })
        .done(function(args){
            var host=config.db.host+':'+config.db.port
            host.should.equal(args.db.host);
            done();
        });
    });
    it('couchdb server connection error',function(done){
        test({
            db:{
                host:config.db.host+':'+config.db.port+'0'
            }
        })
        .fail(function(error){
            'connect'.should.equal(error.syscall);
            done();
        });
    });
});

