'use strict';

var should=require('should')
  , f=require('../../../planners/functions/couchdb')

var setting={
    host:'http://localhost:5984'
  , dbuser:'jacobian'
  , dbpass:'asdf'
  , dbname:'test'
};

describe('couchdb functions',function(){
    describe('testing couchdb server',function(){
        it('couchdb server success connection',function(done){
            f.testcouchdb({host:setting.host})
            .done(function(args){
                setting.host.should.equal(args.host);
                done();
            });
        });
        it('couchdb server connection error',function(done){
            f.testcouchdb({host:setting.host+'0'})
            .fail(function(error){
                'connect'.should.equal(error.syscall);
                done();
            });
        });
    });

    describe('testing couchdb authentification',function(){
        it('couchdb authentification success',function(done){
            f.couchdbauth({
                host:setting.host
              , dbuser:setting.dbuser
              , dbpass:setting.dbpass
            })
            .done(function(args){
                args.should.have.property('cookie')
                    .with.match(/^AuthSession=.*$/);
                done();
            });
        });
        it('couchdb authentification error',function(done){
            f.couchdbauth({
                host:setting.host
              , dbuser:setting.dbuser
              , dbpass:setting.dbpass+'0'
            })
            .fail(function(error){
                error.should.have.property('error')
                     .with.equal('unauthorized');
                done();
            });
        });
    });

    describe('testing list of databases',function(){
        var cookie;

        before(function(done){
            f.couchdbauth({
                host:setting.host
              , dbuser:setting.dbuser
              , dbpass:setting.dbpass
            })
            .done(function(args){
                cookie=args.cookie;
                done();
            });
        });

        it('listing of databases',function(done){
            f.listdb({
                host:setting.host
              , cookie:cookie
            })
            .done(function(args){
                done();
            });
        });
    });

    describe('testing creation of database',function(){
        var cookie;

        before(function(done){
            f.couchdbauth({
                host:setting.host
              , dbuser:setting.dbuser
              , dbpass:setting.dbpass
            })
            .done(function(args){
                cookie=args.cookie;
                done();
            });
        });

        it('couchdb create database success',function(done){
            f.createdb({
                host:setting.host
              , dbname:setting.dbname
              , cookie:cookie
            })
            .done(function(args){
                done();
            });
        });

        after(function(done){
            f.deletedb({
                host:setting.host
              , dbname:setting.dbname
              , cookie:cookie
            })
            .done(function(args){
                done();
            });
        });
    });

    describe('testing delete of database',function(){
        var cookie;

        before(function(done){
            f.couchdbauth({
                host:setting.host
              , dbuser:setting.dbuser
              , dbpass:setting.dbpass
            })
            .then(function(args){
                cookie=args.cookie
                f.createdb({
                    host:setting.host
                  , dbname:setting.dbname
                  , cookie:cookie
                })
                .done(function(args){
                    done();
                });
            });
        });

        it('couchdb delete database success',function(done){
            f.deletedb({
                host:setting.host
              , dbname:setting.dbname
              , cookie:cookie
            })
            .done(function(args){
                done();
            });
        });
    });
});

