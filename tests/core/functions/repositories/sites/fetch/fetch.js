'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , auth=require(base+'/databases/auth')
  , create=require(base+'/databases/create')
  , summary=require(base+'/repositories/sites/create/summary')
  , rootsite=require(base+'/repositories/sites/create/rootsite')
  , design=require(base+'/repositories/sites/create/designdocument')
  , wait=require(base+'/repositories/sites/fetch/getwaitdocument')
  , lock=require(base+'/repositories/sites/fetch/lockdocument')
  , head=require(base+'/repositories/sites/fetch/headrequest')
  , get=require(base+'/repositories/sites/fetch/getrequest')
  , body=require(base+'/repositories/sites/fetch/bodyanalyzer')
  , complete=require(base+'/repositories/sites/fetch/completedocument')
  , spread=require(base+'/repositories/sites/fetch/spreadrefs')
  , remove=require(base+'/databases/remove')

describe('site fetcher pages functions',function(){
    var packet;

    before(function(done){
        auth({
            db:{
                host:host
              , user:user
              , pass:pass
              , name:name
            }
          , site:{
                url:url
            }
        })
       .then(create)
       .then(summary)
       .then(rootsite)
       .then(design)
        .done(function(args){
            packet=args;
            done();
        });
    });

    describe('testing get a waiting task',function(){
        it('getting wait page',function(done){
            wait(packet)
            .done(function(args){
                args.task.should.have.property('wait');
                packet=args;
                done();
            });
        });
    });

    describe('testing look a page in repository',function(){
        it('look a waiting page',function(done){
            lock(packet)
            .done(function(args){
                args.task.should.have.property('lock');
                packet=args;
                done();
            });
        });
    });

    describe('testing head request in a page',function(){
        it('head request',function(done){
            head(packet)
            .done(function(args){
                args.task.should.have.property('head');
                packet=args;
                done();
            });
        });
    });

    describe('testing get request in a page',function(){
        it('get request',function(done){
            get(packet)
            .done(function(args){
                if(args.task.head.get){
                    args.task.should.have.property('get');
                }
                packet=args;
                done();
            });
        });
    });

    describe('testing body analyzer in a page',function(){
        it('body analyzer for links',function(done){
            body(packet)
            .done(function(args){
                if(args.task.head.get){
                    args.task.should.have.property('ref');
                    args.task.ref.should.have.property('links');
                    args.task.ref.should.have.property('related');
                }
                packet=args;
                done();
            });
        });
    });

    describe('testing complete a page in repository',function(){
        it('complete a look page',function(done){
            complete(packet)
            .done(function(args){
                args.task.should.have.property('complete');
                packet=args;
                done();
            });
        });
    });

    describe('testing of spreading new pages',function(){
        it('spread the links extracted',function(done){
            spread(packet)
            .done(function(args){
                args.task.should.have.property('spread').and.be.Array;
                packet=args;
                done();
            });
        });
    });

    after(function(done){
        remove(packet)
        .done(function(args){
            done();
        });
    });
});

