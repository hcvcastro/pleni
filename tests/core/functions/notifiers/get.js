'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , get=require(base+'/notifiers/get')
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
    });
});

