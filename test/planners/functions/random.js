'use strict';

var should=require('should')
  , generator=require('../../../planners/functions/utils/random')

describe('random functions',function(){
    describe('testing random generator',function(){
        it('random generator',function(done){
            generator({})
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('random');
                args.random.length.should.be.equal(40);
                done();
            });
        });
    });
});

