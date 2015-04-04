'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , test=require(base+'/planners/test')
  , config=require('../../../../config/tests')
  , servers=config.planners

servers.forEach(function(element){
    describe('planner functions',function(){
        before(function(done){
            require('../../../../'+element.script);
            done();
        });

        it('planner server success connection',function(done){
            test({
                planner:{
                    host:element.host+':'+element.port
                }
            })
            .done(function(args){
                var host=element.host+':'+element.port
                host.should.equal(args.planner.host);
                done();
            });
        });

        it('planner server connection error',function(done){
            test({
                planner:{
                    host:element.host+':'+element.port+'0'
                }
            })
            .fail(function(error){
                'connect'.should.equal(error.syscall);
            })
            .done(function(args){
                done();
            });
        });
    });
});

