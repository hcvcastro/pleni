'use strict';

var should=require('should')
  , test=require('../../../planners/functions/planners/test')
  , api=require('../../../planners/functions/planners/api')
  , status=require('../../../planners/functions/planners/status')
  , set=require('../../../planners/functions/planners/set')
  , run=require('../../../planners/functions/planners/run')
  , stop=require('../../../planners/functions/planners/stop')
  , remove=require('../../../planners/functions/planners/remove')
  , setting={
        host:'http://localhost'
      , port:3001
    }

describe('planner functions',function(){
    describe('testing planner',function(){
        var url=setting.host+':'+setting.port
          , tid

        it('planner server success connection',function(done){
            test({host:url})
            .done(function(args){
                args.host.should.equal(url);
                done();
            });
        });

        it('planner server connection error',function(done){
            test({host:setting.host+':'+(setting.port-2)})
            .fail(function(error){
                'connect'.should.equal(error.syscall);
            })
            .done(function(args){
                done();
            });
        });

        it('get status for planner server',function(done){
            status({host:url})
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('status');
                done();
            })
        });

        it('get api for planner server',function(done){
            api({host:url})
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('all_tasks');
                args.all_tasks.should.be.an.Array;
                done();
            })
        });

        it('set task in planner server',function(done){
            set({host:url,task:{name:'exclusive',count:1,interval:1000}})
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('host').and.be.eql(url);
                tid=args.tid;
                done();
            })
        });

        it('set task in planner server (error)',function(done){
            set({host:url,task:{name:'exclusive',count:1,interval:1000}})
            .fail(function(error){
                error.should.be.an.Object;
                error.should.have.property('ok').and.be.eql(false);
                done();
            })
        });

        it('running task in planner server',function(done){
            run({host:url,tid:tid,targs:{}})
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('host');
                args.should.have.property('tid');
                done();
            })
        });

        it('stopping task in planner server',function(done){
            stop({host:url,tid:tid})
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('host');
                args.should.have.property('tid');
                done();
            })
        });

        it('remove task in planner server',function(done){
            remove({host:url,tid:tid})
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('host');
                args.should.have.property('tid');
                done();
            });
        });
    });
});

