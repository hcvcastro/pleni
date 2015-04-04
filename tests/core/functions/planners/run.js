'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , set=require(base+'/planners/set')
  , unset=require(base+'/planners/unset')
  , run=require(base+'/planners/run')
  , config=require('../../../../config/tests')
  , servers=config.planners

servers.forEach(function(element){
    var tid;

    describe('planner functions',function(){
        before(function(done){
            require('../../../../'+element.script);
            done();
        });

        it('set task in planner server',function(done){
            set({
                planner:{
                    host:element.host+':'+element.port
                }
              , task:{
                    name:'exclusive'
                  , count:1
                  , interval:1000
                }
            })
            .done(function(args){
                var host=element.host+':'+element.port

                args.should.be.an.Object;
                args.should.have.property('planner');
                args.planner.should.be.an.Object;
                args.planner.should.have.property('host').and.be.eql(host);
                tid=args.planner.tid;
                done();
            })
        });

        it('running task in planner server',function(done){
            run({
                planner:{
                    host:element.host+':'+element.port
                  , tid:tid
                  , targs:{}
                }
            })
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('planner');
                args.planner.should.be.an.Object;
                args.planner.should.have.property('host');
                args.planner.should.have.property('tid');
                done();
            })
        });

        it('unset task in planner server',function(done){
            unset({
                planner:{
                    host:element.host+':'+element.port
                  , tid:tid
                }
            })
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('planner');
                args.planner.should.be.an.Object;
                args.planner.should.have.property('host');
                args.planner.should.have.property('tid');
                done();
            });
        });
    });
});

