'use strict';

var should=require('should')
  , test=require('../../../planners/functions/notifiers/test')
  , get=require('../../../planners/functions/notifiers/get')

var host='http://localhost'
  , port=3002

describe('notifier functions',function(){
    var url=host+':'+port

    it('notifier server sucess connection',function(done){
        test({
            notifier:{
                host:url
            }
        })
        .done(function(args){
            args.notifier.host.should.equal(url);
            done();
        });
    });

    it('notifier server connection error',function(done){
        test({
            notifier:{
                host:host+':'+(port-3)
            }
        })
        .fail(function(error){
            'connect'.should.equal(error.syscall);
        })
        .done(function(args){
            done();
        });
    });

    it('get planners in notifier server',function(done){
        get({
            notifier:{
                host:url
            }
        })
        .done(function(args){
            args.should.be.an.Object;
            args.notifier.should.be.an.Object;
            args.notifier.should.have.property('planners');
            args.notifier.planners.should.be.an.Array;
            done();
        })
    });
});

