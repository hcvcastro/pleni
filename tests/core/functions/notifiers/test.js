'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , test=require(base+'/notifiers/test')
  , config=require('../../../../config/tests')
  , servers=config.notifiers

servers.forEach(function(element){
    describe('notifier functions',function(){
        before(function(done){
            require('../../../../'+element.script);
            done();
        });

        it('notifier server sucess connection',function(done){
            test({
                notifier:{
                    host:element.host+':'+element.port
                }
            })
            .done(function(args){
                var host=element.host+':'+element.port
                host.should.equal(args.notifier.host);
                done();
            });
        });

        it('notifier server connection error',function(done){
            test({
                notifier:{
                    host:element.host+':'+element.port+'0'
                }
            })
            .fail(function(error){
                'connect'.should.equal(error.syscall);
            })
            .done(function(args){
                done();
            });
        });
    });
});

