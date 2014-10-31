'use strict';

var should=require('should')
  , test=require('../../../planners/functions/databases/test')
  , auth=require('../../../planners/functions/databases/auth')
  , listdb=require('../../../planners/functions/databases/list')
  , infodbs=require('../../../planners/functions/databases/infodbs')
  , create=require('../../../planners/functions/databases/create')
  , remove=require('../../../planners/functions/databases/remove')

var host='http://localhost:5984'
  , user='jacobian'
  , pass='asdf'
  , name='test'
  , prefix='pleni_'

describe('couchdb functions',function(){
    describe('testing couchdb server',function(){
        it('couchdb server success connection',function(done){
            test({db:{host:host}})
            .done(function(args){
                host.should.equal(args.db.host);
                done();
            });
        });
        it('couchdb server connection error',function(done){
            test({db:{host:host+'0'}})
            .fail(function(error){
                'connect'.should.equal(error.syscall);
                done();
            });
        });
    });

    describe('testing couchdb authentification',function(){
        it('couchdb authentification success',function(done){
            auth({
                db:{
                    host:host
                  , user:user
                  , pass:pass
                }
            })
            .done(function(args){
                args.should.have.property('auth');
                args.auth.should.have.property('cookie')
                    .with.match(/^AuthSession=.*$/);
                done();
            });
        });
        it('couchdb authentification error',function(done){
            auth({
                db:{
                    host:host
                  , user:user
                  , pass:pass+'0'
                }
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
            auth({
                db:{
                    host:host
                  , user:user
                  , pass:pass
                }
            })
            .done(function(args){
                cookie=args.auth.cookie;
                done();
            });
        });

        it('listing of databases',function(done){
            listdb({
                db:{
                    host:host
                }
              , auth:{
                    cookie:cookie
                }
            })
            .done(function(args){
                args.should.be.an.Object;
                args.should.have.property('db');
                args.db.should.have.property('list');
                args.db.list.should.be.an.Array;
                done();
            });
        });
    });

    describe('testing of getting properties',function(){
        var cookie;
        var databases;

        before(function(done){
            auth({
                db:{
                    host:host
                  , user:user
                  , pass:pass
                }
            })
            .then(listdb)
            .done(function(args){
                cookie=args.auth.cookie;
                databases=args.db.list;
                done();
            });
        });

        it('getting properties',function(done){
            infodbs({
                db:{
                    host:host
                  , prefix:prefix
                  , list:databases
                }
              , auth:{
                    cookie:cookie
                }
            })
            .done(function(args){
                args.db.explist.should.be.an.Array;
                for(var i in args.db.explist){
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
            auth({
                db:{
                    host:host
                  , user:user
                  , pass:pass
                }
            })
            .done(function(args){
                cookie=args.auth.cookie;
                done();
            });
        });

        it('couchdb create database success',function(done){
            create({
                db:{
                    host:host
                  , name:name
                }
              , auth:{
                    cookie:cookie
                }
            })
            .done(function(args){
                done();
            });
        });

        after(function(done){
            remove({
                db:{
                    host:host
                  , name:name
                }
              , auth:{
                    cookie:cookie
                }
            })
            .done(function(args){
                done();
            });
        });
    });

    describe('testing delete of database',function(){
        var cookie;

        before(function(done){
            auth({
                db:{
                    host:host
                  , user:user
                  , pass:pass
                }
            })
            .then(function(args){
                cookie=args.auth.cookie
                create({
                    db:{
                        host:host
                      , name:name
                    }
                  , auth:{
                        cookie:cookie
                    }
                })
                .done(function(args){
                    done();
                });
            });
        });

        it('couchdb delete database success',function(done){
            remove({
                db:{
                    host:host
                  , name:name
                }
              , auth:{
                    cookie:cookie
                }
            })
            .done(function(args){
                done();
            });
        });
    });
});

