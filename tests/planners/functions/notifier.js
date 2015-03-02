'use strict';

var should=require('should')
  , base='../../../core/functions'
  , test=require(base+'/notifiers/test')
  , get=require(base+'/notifiers/get')
  , add=require(base+'/notifiers/add')
  , remove=require(base+'/notifiers/remove')
  , clean=require(base+'/notifiers/clean')

var host='http://localhost'
  , port=3000

describe('notifier functions',function(){
    var url=host+':'+port

    it('notifier server sucess connection',function(done){
        test({
            notifier:{
                host:url
            }
        })
        .done(function(args){
            args.notifier.host.should.equal(url);
            done();
        });
    });

    it('notifier server connection error',function(done){
        test({
            notifier:{
                host:host+':'+(port-3)
            }
        })
        .fail(function(error){
            'connect'.should.equal(error.syscall);
        })
        .done(function(args){
            done();
        });
    });

    it('clean in notifier server',function(done){
        clean({
            notifier:{
                host:url
            }
        })
        .done(function(args){
            args.should.be.an.Object;
            args.should.have.property('notifier');
            args.notifier.should.have.property('host');
            done();
        });
    });

    it('get planners in notifier server',function(done){
        get({
            notifier:{
                host:url
            }
        })
        .done(function(args){
            args.should.be.an.Object;
            args.notifier.should.be.an.Object;
            args.notifier.should.have.property('planners');
            args.notifier.planners.should.be.an.Array.and.be.empty;
            done();
        })
    });

    it('add planner in notifier server',function(done){
        add({
            notifier:{
                host:url
            }
          , planner:{
                host:'http://localhost'
              , port:3001
            }
        })
        .done(function(args){
            args.should.be.an.Object;
            args.notifier.should.be.an.Object;
            done();
        })
    });

    it('get planners in notifier server',function(done){
        get({
            notifier:{
                host:url
            }
        })
        .done(function(args){
            args.should.be.an.Object;
            args.notifier.should.be.an.Object;
            args.notifier.should.have.property('planners');
            args.notifier.planners.should.be.an.Array.and.have.length(1);
            args.notifier.planners[0].should.have.property('planner');
            args.notifier.planners[0].planner.should.have.property('host');
            args.notifier.planners[0].planner.should.have.property('port');
            done();
        })
    });

    it('remove planner in notifier server',function(done){
        remove({
            notifier:{
                host:url
              }
            , planner:{
                host:'http://localhost'
              , port:3001
            }
        })
        .done(function(args){
            args.should.be.an.Object;
            args.notifier.should.be.an.Object;
            done();
        })
    });

    it('get planners in notifier server',function(done){
        get({
            notifier:{
                host:url
            }
        })
        .done(function(args){
            args.should.be.an.Object;
            args.notifier.should.be.an.Object;
            args.notifier.should.have.property('planners');
            args.notifier.planners.should.be.an.Array.and.be.empty;
            done();
        })
    });

    it('clean in notifier server',function(done){
        clean({
            notifier:{
                host:url
            }
        })
        .done(function(args){
            args.should.be.an.Object;
            args.should.have.property('notifier');
            args.notifier.should.have.property('host');
            done();
        });
    });
});

