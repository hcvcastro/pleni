'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , auth=require(base+'/databases/auth')
  , list=require(base+'/databases/list')
  , infodbs=require(base+'/databases/infodbs')
  , config=require('../../../../config/tests')

describe('testing of getting properties',function(){
    var cookie;
    var databases;

    before(function(done){
        auth({
            db:{
                host:config.db.host+':'+config.db.port
              , user:config.db.user
              , pass:config.db.pass
            }
        })
        .then(list)
        .done(function(args){
            cookie=args.auth.cookie;
            databases=args.db.list;
            done();
        });
    });

    it('getting properties',function(done){
        infodbs({
            db:{
                host:config.db.host+':'+config.db.port
              , prefix:''
              , list:databases
            }
          , auth:{
                cookie:cookie
            }
        })
        .done(function(args){
            args.db.explist.should.be.an.Array;
            for(var i in args.db.explist){
                args.db.explist[i].should.have.property('db_name');
                args.db.explist[i].should.have.property('doc_count');
                args.db.explist[i].should.have.property('update_seq');
                args.db.explist[i].should.have.property('disk_size');
                args.db.explist[i].should.have.property('data_size');
                args.db.explist[i].should.have.
                    property('instance_start_time');
            }
            done();
        });
    });
});

