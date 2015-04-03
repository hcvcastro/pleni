'use strict';

var should=require('should')
  , base='../../../core/functions'
  , test=require(base+'/notifiers/test')
  , get=require(base+'/notifiers/get')
  , add=require(base+'/notifiers/add')
  , remove=require(base+'/notifiers/remove')
  , clean=require(base+'/notifiers/clean')
  , notifiers=[{
        script:'../../../server/notifier.io'
      , url:'http://localhost:3002'
    },{
        script:'../../../server/master'
      , url:'http://localhost:3000'
    }]

notifiers.forEach(function(element){
    describe('notifier functions',function(){
        before(function(done){
            require(element.script);
            done();
        });

        it('notifier server sucess connection',function(done){
            test({
                notifier:{
                    host:element.url
                }
            })
            .done(function(args){
                args.notifier.host.should.equal(element.url);
                done();
            });
        });

        it('notifier server connection error',function(done){
            test({
                notifier:{
                    host:element.url+'0'
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
                    host:element.url
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
                    host:element.url
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
                    host:element.url
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
                    host:element.url
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
                    host:element.url
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
                    host:element.url
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
                    host:element.url
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
});
