'use strict';

var should=require('should')
  , validate=require('../../../master/validators')

describe('validators functions',function(){
    it('empty validation',function(done){
        validate.notEmpty().should.be.false;
        validate.notEmpty('').should.be.false;
        validate.notEmpty('test').should.be.true;
        done();
    });

    it('host validation',function(done){
        validate.validHost().should.be.false;
        validate.validHost('nothing').should.be.false;
        validate.validHost('localhost').should.be.true;
        validate.validHost('127.0.0.1').should.be.true;
        validate.validHost('http://main.local/').should.be.true;
        validate.validHost('rsync://main.local/').should.be.false;
        done();
    });

    it('port validation',function(done){
        validate.validPort('').should.be.false;
        validate.validPort('-80').should.be.false;
        validate.validPort('0').should.be.false;
        validate.validPort('1').should.be.true;
        validate.validPort('1024').should.be.true;
        validate.validPort('65536').should.be.false;
        done();
    });

    it('slug validation',function(done){
        validate.validSlug().should.be.false;
        validate.validSlug('').should.be.false;
        validate.validSlug('1').should.be.false;
        validate.validSlug('a').should.be.true;
        validate.validSlug('perfect').should.be.true;
        validate.validSlug('perfect1').should.be.true;
        validate.validSlug('perfect_').should.be.true;
        done();
    });
});

