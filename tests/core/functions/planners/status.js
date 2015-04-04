'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , status=require(base+'/planners/status')
  , config=require('../../../../config/tests')
  , servers=config.planners

servers.forEach(function(element){
    describe('planner functions',function(){
        before(function(done){
            require('../../../../'+element.script);
            done();
        });

        it('get status for planner server',function(done){
            status({
                planner:{
                    host:element.host+':'+element.port
                }
            })
            .done(function(args){
                args.should.be.an.Object;
                args.planner.should.be.an.Object;
                args.planner.should.have.property('status');
                done();
            })
        });
    });
});

