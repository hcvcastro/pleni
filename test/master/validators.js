'use strict';

var assert=require('assert')
  , validate=require('../server/validators');

describe('validators',function(){
    describe('validators functions',function(){
        it('empty validation',function(done){
            assert.equal(validate.notEmpty(),false);
            assert.equal(validate.notEmpty(''),false);
            assert.equal(validate.notEmpty('test'),true);
            done();
        });

        it('host validation',function(done){
            assert.equal(validate.validHost(),false);
            assert.equal(validate.validHost('nothing'),false);
            assert.equal(validate.validHost('localhost'),true);
            assert.equal(validate.validHost('127.0.0.1'),true);
            assert.equal(validate.validHost('http://main.local/'),true);
            assert.equal(validate.validHost('rsync://main.local/'),false);
            done();
        });

        it('port validation',function(done){
            assert.equal(validate.validPort(''),false);
            assert.equal(validate.validPort('-80'),false);
            assert.equal(validate.validPort('0'),false);
            assert.equal(validate.validPort('1'),true);
            assert.equal(validate.validPort('1024'),true);
            assert.equal(validate.validPort('65536'),false);
            done();
        });

        it('slug validation',function(done){
            assert.equal(validate.validSlug(),false);
            assert.equal(validate.validSlug(''),false);
            assert.equal(validate.validSlug('1'),false);
            assert.equal(validate.validSlug('a'),true);
            assert.equal(validate.validSlug('perfect'),true);
            assert.equal(validate.validSlug('perfect1'),true);
            assert.equal(validate.validSlug('perfect_'),true);
            done();
        });
    });
});

