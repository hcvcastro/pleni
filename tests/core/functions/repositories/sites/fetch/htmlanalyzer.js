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
  , analyzer=require(base+'/repositories/sites/fetch/htmlanalyzer')
  , config=require('../../../../../../config/tests')
  , db_name='fetch_htmlanalyzer'
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
            init(packet)
            .then(auth)
            .then(wait)
            .then(lock)
            .then(head)
            .then(get)
            .then(createrequest)
            .then(function(args){
                packet=args;
                done();
            });
        });
    });

    describe('testing body analyzer in a page',function(){
        it('body analyzer for links',function(done){
            analyzer(packet)
            .done(function(args){
                args.should.have.property('task');
                if('refs' in args.task){
                    args.task.should.have.property('refs').and.be.Array;
                }
                if('rels' in args.task){
                    args.task.should.have.property('rels').and.be.Array;
                }
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

