'use strict';

var should=require('should')
  , validate=require('../../core/validators')

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
        validate.validHost('hiperborea.com.bo').should.be.true;
        validate.validHost('http://main.local/').should.be.true;
        validate.validHost('http://main.local').should.be.true;
        validate.validHost('rsync://main.local/').should.be.false;
        done();
    });

    it('host filtering',function(done){
        validate.toValidHost('http://localhost//')
            .should.be.equal('http://localhost');
        validate.toValidHost('http://localhost/')
            .should.be.equal('http://localhost');
        validate.toValidHost('http://localhost////')
            .should.be.equal('http://localhost');
        validate.toValidHost('http://localhost')
            .should.be.equal('http://localhost');
        validate.toValidHost('localhost')
            .should.be.equal('http://localhost');

        validate.toValidHost('http://localhost/a.html')
            .should.be.equal('http://localhost');
        validate.toValidHost('http://localhost/a/b/c.html')
            .should.be.equal('http://localhost');
        done();
    });

    it('url filtering',function(done){
        validate.toValidUrl('http://localhost/a/b/c/d.php')
            .should.be.equal('http://localhost/a/b/c/d.php');
        validate.toValidUrl('http://localhost/a/b/c/d.php#e')
            .should.be.equal('http://localhost/a/b/c/d.php');
        validate.toValidUrl('http://localhost/a/b/c/d.php?e=f')
            .should.be.equal('http://localhost/a/b/c/d.php');
        validate.toValidUrl('http://localhost/a/b/c/d.php?e=f&g=h')
            .should.be.equal('http://localhost/a/b/c/d.php');
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

