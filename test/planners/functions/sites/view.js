'use strict';

var should=require('should')
  , base='../../../../planners/functions'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
  , create=require(base+'/databases/create')
  , summary=require(base+'/repositories/sites/create/summary')
  , rootsite=require(base+'/repositories/sites/create/rootsite')
  , design=require(base+'/repositories/sites/create/designdocument')
  , getsummary=require(base+'/repositories/sites/view/getsummary')
  , getmapsite=require(base+'/repositories/sites/view/getmapsite')

var host='http://localhost:5984'
  , user='jacobian'
  , pass='asdf'
  , name='db_test'

describe('site fetcher pages functions',function(){
    var packet;

    describe('testing for viewer a site',function(){
        it('view api site',function(done){
            auth({
                db:{
                    host:host
                  , user:user
                  , pass:pass
                  , name:name
                }
            })
            .then(getsummary)
            .then(getmapsite)
            .done(function(args){
                args.should.have.property('site');
                args.site.should.have.property('summary');
                args.site.summary.should.have.property('_rev');
                args.site.should.have.property('mapsite');
                //args.site.mapsite.should.be.an.Array;
                done();
            });
        });
    });
});

