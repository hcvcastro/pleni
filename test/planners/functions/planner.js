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

        it('get api for planner server',function(done){
            f.api({host:url})
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('all_tasks');
                args.all_tasks.should.be.an.Array;
                done();
            })
        });

        it('set task in planner server',function(done){
            f.set({host:url,task:{name:'exclusive',count:1,interval:1000}})
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('host').and.be.eql(url);
                tid=args.tid;
                done();
            })
        });

        it('set task in planner server (error)',function(done){
            f.set({host:url,task:{name:'exclusive',count:1,interval:1000}})
            .fail(function(error){
                error.should.be.an.Object;
                error.should.have.property('ok').and.be.eql(false);
                done();
            })
        });

        it('running task in planner server',function(done){
            f.run({host:url,tid:tid,targs:{}})
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('host');
                args.should.have.property('tid');
                done();
            })
        });

        it('stopping task in planner server',function(done){
            f.stop({host:url,tid:tid})
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('host');
                args.should.have.property('tid');
                done();
            })
        });

        it('remove task in planner server',function(done){
            f.delete({host:url,tid:tid})
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('host');
                args.should.have.property('tid');
                done();
            });
        });
    });
});

