'use strict';

var should=require('should')
  , base='../../../core/functions'
  , test=require(base+'/planners/test')
  , api=require(base+'/planners/api')
  , status=require(base+'/planners/status')
  , set=require(base+'/planners/set')
  , unset=require(base+'/planners/unset')
  , run=require(base+'/planners/run')
  , stop=require(base+'/planners/stop')

var host='http://localhost'
  , port=3001

describe('planner functions',function(){
    var url=host+':'+port
      , tid

    it('planner server success connection',function(done){
        test({
            planner:{
                host:url
            }
        })
        .done(function(args){
            args.planner.host.should.equal(url);
            done();
        });
    });

    it('planner server connection error',function(done){
        test({
            planner:{
                host:host+':'+(port-2)
            }
        })
        .fail(function(error){
            'connect'.should.equal(error.syscall);
        })
        .done(function(args){
            done();
        });
    });

    it('get status for planner server',function(done){
        status({
            planner:{
                host:url
            }
        })
        .done(function(args){
            args.should.be.an.Object;
            args.planner.should.be.an.Object;
            args.planner.should.have.property('status');
            done();
        })
    });

    it('get api for planner server',function(done){
        api({
            planner:{
                host:url
            }
        })
        .done(function(args){
            args.should.be.an.Object;
            args.planner.should.be.an.Object;
            args.planner.should.have.property('tasks');
            args.planner.tasks.should.be.an.Array;
            done();
        })
    });

    it('set task in planner server',function(done){
        set({
            planner:{
                host:url
            }
          , task:{
                name:'exclusive'
              , count:1
              , interval:1000
            }
        })
        .done(function(args){
            args.should.be.an.Object;
            args.should.have.property('planner');
            args.planner.should.be.an.Object;
            args.planner.should.have.property('host').and.be.eql(url);
            tid=args.planner.tid;
            done();
        })
    });

    it('set task in planner server (error)',function(done){
        set({
            planner:{
                host:url
            }
          , task:{
                name:'exclusive'
              , count:1
              , interval:1000
            }
        })
        .fail(function(error){
            error.should.be.an.Object;
            error.should.have.property('error').and.be.eql('not override');
        })
        .done(function(args){
            done();
        })
    });

    it('running task in planner server',function(done){
        run({
            planner:{
                host:url
              , tid:tid
              , targs:{}
            }
        })
        .done(function(args){
            args.should.be.an.Object;
            args.should.have.property('planner');
            args.planner.should.be.an.Object;
            args.planner.should.have.property('host');
            args.planner.should.have.property('tid');
            done();
        })
    });

    it('stopping task in planner server',function(done){
        stop({
            planner:{
                host:url
              , tid:tid
            }
        })
        .done(function(args){
            args.should.be.an.Object;
            args.should.have.property('planner');
            args.planner.should.be.an.Object;
            args.planner.should.have.property('host');
            args.planner.should.have.property('tid');
            done();
        })
    });

    it('unset task in planner server',function(done){
        unset({
            planner:{
                host:url
              , tid:tid
            }
        })
        .done(function(args){
            args.should.be.an.Object;
            args.should.have.property('planner');
            args.planner.should.be.an.Object;
            args.planner.should.have.property('host');
            args.planner.should.have.property('tid');
            done();
        });
    });
});

