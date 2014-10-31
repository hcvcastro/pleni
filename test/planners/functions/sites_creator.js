'use strict';

var should=require('should')
  , test=require('../../../planners/functions/databases/test')
  , auth=require('../../../planners/functions/databases/auth')
  , create=require('../../../planners/functions/databases/create')
  , summary=require('../../../planners/functions/repositories/sites/create/summary')

var host='http://localhost:5984'
  , user='jacobian'
  , pass='asdf'
  , name='test'
  , url='http://galao.main'

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
            g.createrootsite({
                host:setting.host
              , dbname:setting.dbname
              , cookie:cookie
              , site_type:setting.site_type
              , site_url:setting.site_url
            })
            .done(function(args){
                args.should.have.property('rev_root');
                done();
            });
        });
    });

    describe('testing create default design document',function(){
        it('design document creation',function(done){
            g.createdesigndocument({
                host:setting.host
              , dbname:setting.dbname
              , cookie:cookie
            })
            .done(function(args){
                args.should.have.property('rev_design');
                done();
            });
        });
    });

    after(function(done){
        f.deletedb({
            host:setting.host
          , dbname:setting.dbname
          , cookie:cookie
        })
        .done(function(args){
            done();
        });
    });
});

