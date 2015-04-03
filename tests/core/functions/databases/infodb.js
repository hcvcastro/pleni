'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , auth=require(base+'/databases/auth')
  , list=require(base+'/databases/list')
  , infodb=require(base+'/databases/infodb')
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
        infodb({
            db:{
                host:config.db.host+':'+config.db.port
              , name:databases[0]
            }
          , auth:{
                cookie:cookie
            }
        })
        .done(function(args){
            var obj=JSON.parse(args.db.info);

            obj.should.have.property('db_name');
            obj.should.have.property('doc_count');
            obj.should.have.property('update_seq');
            obj.should.have.property('disk_size');
            obj.should.have.property('data_size');
            obj.should.have.property('instance_start_time');
            done();
        });
    });
});

