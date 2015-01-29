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

describe('viewer functions for site repository',function(){
    var packet;

    before(function(done){
        auth({
            db:{
                host:host
              , user:user
              , pass:pass
              , name:name
            }
        })
        .done(function(args){
            packet=args;
            done();
        });
    });

    it('testing function getsummary',function(done){
        getsummary(packet)
        .done(function(args){
            args.should.have.property('site');
            args.site.should.have.property('summary');
            args.site.summary.should.have.property('_id');
            args.site.summary.should.have.property('_rev');
            args.site.summary.should.have.property('ts_created');
            args.site.summary.should.have.property('ts_modified');
            args.site.summary.should.have.property('type');
            args.site.summary.should.have.property('url');
            done();
        });
    });

    it('testing function getmapsite',function(done){
        getmapsite(packet)
        .done(function(args){
            args.should.have.property('site');
            args.site.should.have.property('mapsite');
            args.site.mapsite.should.have.property('count');
            args.site.mapsite.should.have.property('nodes').and.be.Array;
            args.site.mapsite.should.have.property('links').and.be.Array;
            console.log(args.site.mapsite);
            done();
        });
    });
});

