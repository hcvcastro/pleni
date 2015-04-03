'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , get=require(base+'/notifiers/get')
  , add=require(base+'/notifiers/add')
  , clean=require(base+'/notifiers/clean')
  , config=require('../../../../config/tests')
  , servers=config.notifiers

servers.forEach(function(element){
    describe('notifier functions',function(){
        before(function(done){
            require('../../../../'+element.script);
            done();
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

        it('clean in notifier server',function(done){
            clean({
                notifier:{
                    host:element.host+':'+element.port
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
