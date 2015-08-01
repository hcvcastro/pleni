'use strict';

var should=require('should')
  , base='../../../../../../core/functions'
  , create=require(base+'/../tasks/site/create')
  , remove=require(base+'/../tasks/site/remove')
  , init=require(base+'/repositories/sites/fetch/init')
  , auth=require(base+'/databases/auth')
  , wait=require(base+'/repositories/sites/fetch/getwaitdocument')
  , lock=require(base+'/repositories/sites/fetch/lockdocument')
  , head=require(base+'/repositories/sites/fetch/headrequest')
  , get=require(base+'/repositories/sites/fetch/getrequest')
  , createrequest=require(base+'/repositories/sites/fetch/createrequest')
  , config=require('../../../../../../config/tests')
  , db_name='fetch_createrequest'
  , repeat=function(){}
  , stop=function(){}

describe('site fetcher pages functions',function(){
    var packet={
        db:{
            host:config.db.host+':'+config.db.port
          , name:config.db.prefix+db_name
          , user:config.db.user
          , pass:config.db.pass
        }
      , debug:true
    };

    before(function(done){
        create({
            db:{
                host:config.db.host+':'+config.db.port
              , name:config.db.prefix+db_name
              , user:config.db.user
              , pass:config.db.pass
            }
          , site:{
                url:config.url
            }
        },repeat,stop,function(){
            init(packet)
            .then(auth)
            .then(wait)
            .then(lock)
            .then(head)
            .then(get)
            .then(function(args){
                packet=args;
                done();
            });
        });
    });

    describe('testing request registry in repository',function(){
        it('GET request',function(done){
            createrequest(packet)
            .done(function(args){
                args.task.should.have.property('get');
                args.task.get.should.have.property('status');
                args.task.get.should.have.property('headers');
                args.task.get.should.have.property('body');
                args.task.get.should.have.property('sha1');
                args.task.get.should.have.property('md5');
                packet=args;
                done();
            });
        });
    });

    after(function(done){
        remove({
            db:{
                host:config.db.host+':'+config.db.port
              , name:config.db.prefix+db_name
              , user:config.db.user
              , pass:config.db.pass
            }
        },repeat,stop,function(){
            done();
        });
    });
});

