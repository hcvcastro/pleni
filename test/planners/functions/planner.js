'use strict';

var should=require('should')
  , f=require('../../../planners/functions/planner')

describe('planner functions',function(){
    describe('testing planner',function(){
        it('planner server success connection',function(done){
            var host='http://localhost:3001'

            f.testplanner({host:host})
            .done(function(args){
                host.should.equal(args.host);
                done();
            });
        });
        it('planner server connection error',function(done){
            var host= 'http://localhost:2999'

            f.testplanner({host:host})
            .fail(function(error){
                'connect'.should.equal(error.syscall);
                done();
            });
        });
    });
});

