'use strict';

var should=require('should')
  , f=require('../../../planners/functions/planner')
  , setting={
        host:'http://localhost'
      , port:3001
    }

describe('planner functions',function(){
    describe('testing planner',function(){
        var url=setting.host+':'+setting.port
          , tid

        it('planner server success connection',function(done){
            f.testplanner({host:url})
            .done(function(args){
                args.host.should.equal(url);
                done();
            });
        });
        it('planner server connection error',function(done){
            f.testplanner({host:setting.host+':'+(setting.port-2)})
            .fail(function(error){
                'connect'.should.equal(error.syscall);
            })
            .done(function(args){
                done();
            });
        });

        it('take control of planner server',function(done){
            f.take({host:url})
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('host').and.be.eql(url);
                args.should.have.property('tid');
                tid=args.tid;
                done();
            })
        });

        it('take control of planner server failure',function(done){
            f.take({host:url})
            .fail(function(error){
                error.should.be.an.Object;
                error.should.have.property('ok').and.be.eql(false);
            })
            .done(function(args){
                done();
            });
        });

        it('loose control of planner server',function(done){
            f.loose({host:url,tid:tid})
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('host').and.be.eql(url);
                done();
            })
        })
    });
});

