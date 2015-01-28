'use strict';

var should=require('should')
  , base='../../../../planners/functions'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
  , create=require(base+'/databases/create')
  , summary=require(base+'/repositories/sites/create/summary')
  , rootsite=require(base+'/repositories/sites/create/rootsite')
  , design=require(base+'/repositories/sites/create/designdocument')
  , remove=require(base+'/databases/remove')

var host='http://localhost:5984'
  , user='jacobian'
  , pass='asdf'
  , name='test'
  , url='http://galao.local'

describe('site initial scaffolding functions',function(){
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

    describe('testing create of summary',function(){
        it('document summary creation',function(done){
            summary({
                db:{
                    host:host
                  , name:name
                }
              , auth:{
                    cookie:cookie
                }
              , site:{
                    url:url
                }
            })
            .done(function(args){
                args.site.should.have.property('summary');
                done();
            });
        });
    });

    describe('testing create of root page',function(){
        it('document page_/ creation',function(done){
            rootsite({
                db:{
                    host:host
                  , name:name
                }
              , auth:{
                    cookie:cookie
                }
              , site:{
                    url:url
                }
            })
            .done(function(args){
                args.site.should.have.property('root');
                done();
            });
        });
    });

    describe('testing create default design document',function(){
        it('design document creation',function(done){
            design({
                db:{
                    host:host
                  , name:name
                }
              , auth:{
                    cookie:cookie
                }
              , site:{
                    url:url
                }
            })
            .done(function(args){
                args.site.should.have.property('design');
                args.site.design.should.have.property('sites');
                done();
            });
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

