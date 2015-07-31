'use strict';

var should=require('should')
  , base='../../../../../../core/functions'
  , create=require(base+'/../tasks/site/create')
  , remove=require(base+'/../tasks/site/remove')
  , auth=require(base+'/databases/auth')
  , wait=require(base+'/repositories/sites/fetch/getwaitdocument')
  , lock=require(base+'/repositories/sites/fetch/lockdocument')
  , request=require(base+'/repositories/sites/fetch/httprequest')
  , analyzer=require(base+'/repositories/sites/fetch/httpanalyzer')
  , spread=require(base+'/repositories/sites/fetch/spreadrels')
  , config=require('../../../../../../config/tests')
  , db_name='fetch_spreadrels'
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
            console.log('created repository');
            auth(packet)
            .then(wait)
            .then(lock)
            .then(request)
            .then(analyzer)
            .then(function(args){
                console.log('ready for spreading...');
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

