'use strict';

var should=require('should')
  , base='../../../../../core/functions'
  , test=require(base+'/monitor/db/test')
  , config=require('../../../../../config/tests')
  , server=config.monitor

describe('testing couchdb server',function(){
    before(function(done){
        require('../../../../../'+server.script);
        done();
    });

    it('monitor dbserver success connection',function(done){
        test({
            db:{
                host:server.url+':'+server.port
            }
        })
        .done(function(args){
            var host=server.url+':'+server.port
            host.should.equal(args.db.host);
            done();
        });
    });
    it('monitor dbserver connection error',function(done){
        test({
            db:{
                host:server.url+':'+server.port+'0'
            }
        })
        .fail(function(error){
            'connect'.should.equal(error.syscall);
            done();
        });
    });
});

