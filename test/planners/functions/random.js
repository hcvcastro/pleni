'use strict';

var should=require('should')
  , f=require('../../../planners/functions/random')

describe('random functions',function(){
    describe('testing random generator',function(){
        it('random generator',function(done){
            var args = f.generatorid({});
            args.should.have.property('random');
            args.random.length.should.be.equal(40);
            done();
        });
    });
});

