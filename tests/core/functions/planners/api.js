'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , api=require(base+'/planners/api')
  , config=require('../../../../config/tests')
  , servers=config.planners

servers.forEach(function(element){
    describe('planner functions',function(){
        before(function(done){
            require('../../../../'+element.script);
            done();
        });

        it('get status for planner server',function(done){
            api({
                planner:{
                    host:element.host+':'+element.port
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
    });
});

