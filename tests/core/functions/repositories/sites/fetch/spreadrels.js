'use strict';

var should=require('should')
  , base='../../../../../../core/functions'
  , create=require(base+'/../tasks/site/create')
  , remove=require(base+'/../tasks/site/remove')
  , auth=require(base+'/databases/auth')
  , wait=require(base+'/repositories/sites/fetch/getwaitdocument')
  , lock=require(base+'/repositories/sites/fetch/lockdocument')
  , head=require(base+'/repositories/sites/fetch/headrequest')
  , get=require(base+'/repositories/sites/fetch/getrequest')
  , body=require(base+'/repositories/sites/fetch/bodyanalyzer')
  , complete=require(base+'/repositories/sites/fetch/completedocument')
  , spread=require(base+'/repositories/sites/fetch/spreadrels')
  , config=require('../../../../../../config/tests')
  , db_name='fetch_lock'
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
            auth(packet)
            .then(wait)
            .then(lock)
            .then(head)
            .then(get)
            .then(body)
            .then(complete)
            .then(function(args){
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

