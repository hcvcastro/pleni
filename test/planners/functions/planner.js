'use strict';

var should=require('should')
  , f=require('../../../planners/functions/planner')
  , setting={
        host:'http://localhost'
      , port:3001
    }

describe('planner functions',function(){
    describe('testing planner',function(){
        it('planner server success connection',function(done){
            f.testplanner({host:setting.host+':'+setting.port})
            .done(function(args){
                var _host=setting.host+':'+setting.port
                _host.should.equal(args.host);
                done();
            });
        });
        it('planner server connection error',function(done){
            f.testplanner({host:setting.host+':'+(setting.port-2)})
            .fail(function(error){
                'connect'.should.equal(error.syscall);
                done();
            });
        });

        it('take control of planner server',function(done){
            f.takecontrol({
                host:setting.host+':'+setting.port
            })
            .done(function(args){
                console.log(args);
                done();
            })
        });
    });
});

