'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , get=require(base+'/notifiers/get')
  , add=require(base+'/notifiers/add')
  , remove=require(base+'/notifiers/remove')
  , config=require('../../../../config/tests')
  , servers=config.notifiers

servers.forEach(function(element){
    describe('notifier functions',function(){
        before(function(done){
            require('../../../../'+element.script);
            done();
        });

        it('add planner in notifier server',function(done){
            add({
                notifier:{
                    host:element.host+':'+element.port
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
                    host:element.host+':'+element.port
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
                    host:element.host+':'+element.port
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
                    host:element.host+':'+element.port
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
    });
});

