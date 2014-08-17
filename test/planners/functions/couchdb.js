'use strict';

var should=require('should')
  , f=require('../../../planners/functions/couchdb')

var setting={
    host:'http://localhost:5984'
  , dbuser:'jacobian'
  , dbpass:'asdf'
  , dbname:'test'
  , prefix:'pleni_'
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
                args.should.be.an.Object;
                args.should.have.property('all_dbs');
                args.all_dbs.should.be.an.Array;
                done();
            });
        });
    });

    describe('testing of getting properties',function(){
        var cookie;
        var databases;

        before(function(done){
            f.couchdbauth({
                host:setting.host
              , dbuser:setting.dbuser
              , dbpass:setting.dbpass
            })
            .then(f.listdb)
            .done(function(args){
                cookie=args.cookie;
                databases=args.all_dbs;
                done();
            });
        });

        it('getting properties',function(done){
            f.getdbs({
                host:setting.host
              , cookie:cookie
              , prefix:setting.prefix
              , all_dbs:databases
            })
            .done(function(args){
                args.should.be.an.Array;
                for(var i in args){
                    args[i].should.have.property('db_name');
                    args[i].should.have.property('doc_count');
                    args[i].should.have.property('update_seq');
                    args[i].should.have.property('disk_size');
                    args[i].should.have.property('data_size');
                    args[i].should.have.property('instance_start_time');
                }
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

