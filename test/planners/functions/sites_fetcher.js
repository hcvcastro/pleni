'use strict';

var should=require('should')
  , f=require('../../../planners/functions/couchdb')
  , g=require('../../../planners/functions/sites_creator')
  , h=require('../../../planners/functions/sites_fetcher')

var setting={
    host:'http://localhost:5984'
  , dbuser:'jacobian'
  , dbpass:'asdf'
  , dbname:'test'
  , site_type: 'site'
  , site_url: 'http://galao.local'
  , agent:'request'
}

describe('site fetcher pages functions',function(){
    var packet;

    before(function(done){
        f.couchdbauth(setting)
       .then(f.createdb)
       .then(g.createsummary)
       .then(g.createrootsite)
       .then(g.createdesigndocument)
        .done(function(args){
            packet=args;
            done();
        });
    });

    describe('testing get a waiting task',function(){
        it('getting wait page',function(done){
            h.getsitetask(packet)
            .done(function(args){
                args.should.have.property('wait_task');
                packet=args;
                done();
            });
        });
    });

    describe('testing look a page in repository',function(){
        it('look a waiting page',function(done){
            h.looksitetask(packet)
            .done(function(args){
                args.should.have.property('look_task');
                packet=args;
                done();
            });
        });
    });

    describe('testing head request in a page',function(){
        it('head request',function(done){
            h.getheadrequest(packet)
            .done(function(args){
                args.should.have.property('request_head');
                packet=args;
                done();
            });
        });
    });

    describe('testing get request in a page',function(){
        it('get request',function(done){
            h.getgetrequest(packet)
            .done(function(args){
                if(args['request_head'].get){
                    args.should.have.property('request_get');
                }
                packet=args;
                done();
            });
        });
    });

    describe('testing body analyzer in a page',function(){
        it('body analyzer for links',function(done){
            h.bodyanalyzerlinks(packet)
            .done(function(args){
                if(args['request_head'].get){
                    args.should.have.property('body_links');
                    args.should.have.property('body_related');
                }
                packet=args;
                done();
            });
        });
    });

    describe('testing complete a page in repository',function(){
        it('complete a look page',function(done){
            h.completesitetask(packet)
            .done(function(args){
                args.should.have.property('complete_task');
                packet=args;
                done();
            });
        });
    });

    describe('testing of spreading new pages',function(){
        it('spread the links extracted',function(done){
            h.spreadsitelinks(packet)
            .done(function(args){
                packet=args;
                done();
            });
        });
    });

    after(function(done){
        f.deletedb(packet)
        .done(function(args){
            done();
        });
    });
});

