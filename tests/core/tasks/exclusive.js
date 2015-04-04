'use strict';

var should=require('should')
  , base='../../../core/tasks'
  , exclusive=require(base+'/exclusive')
  , repeat=function(){}
  , stop=function(){}

describe('testing task exclusive',function(){
    it('loop 0',function(done){
        exclusive({},repeat,stop,function(params){
            params.should.have.an.Object;
            params.should.have.property('action')
                .and.be.eql('task');
            params.should.have.property('task')
            params.task.should.have.property('id')
                .and.be.eql('exclusive');
            params.task.should.have.property('msg')
                .and.be.eql('loop: 0');
            done();
        });
    });

    it('loop 1',function(done){
        exclusive({},repeat,stop,function(params){
            params.should.have.an.Object;
            params.should.have.property('action')
                .and.be.eql('task');
            params.should.have.property('task')
            params.task.should.have.property('id')
                .and.be.eql('exclusive');
            params.task.should.have.property('msg')
                .and.be.eql('loop: 1');
            done();
        });
    });

    it('loop 2',function(done){
        exclusive({},repeat,stop,function(params){
            params.should.have.an.Object;
            params.should.have.property('action')
                .and.be.eql('task');
            params.should.have.property('task')
            params.task.should.have.property('id')
                .and.be.eql('exclusive');
            params.task.should.have.property('msg')
                .and.be.eql('loop: 2');
            done();
        });
    });
});

