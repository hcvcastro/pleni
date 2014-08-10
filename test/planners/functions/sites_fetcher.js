'use strict';

var should=require('should')
  , f=require('../../../planners/functions/couchdb')
  , g=require('../../../planners/functions/sites_creator')
  , h=require('../../../planners/functions/sites_fetcher')

var setting={
    host:'http://localhost:5984'
  , dbuser:'jacobian'
  , dbpass:'asdf'
  , dbname:'test'
  , site_type: 'site'
  , site_url: 'http://galao.main'
}

describe('site fetcher pages functions',function(){
    var cookie;

    /*before(function(done){
        f.couchdbauth(setting
            host:setting.host
          , dbuser:setting.dbuser
          , dbpass:setting.dbpass
        })
        .then(function(args){
            cookie=args.cookie
            f.createdb({
                host:setting.host
              , dbname:setting.dbname
              , cookie:cookie
            })
            .done(function(args){
                done();
            });
        });
    });*/

    describe('testing get a waiting task',function(){
        it('getting wait page',function(done){
            done();
            /*g.createsummary({
                host:setting.host
              , dbname:setting.dbname
              , cookie:cookie
              , site_type:setting.site_type
              , site_url:setting.site_url
            })
            .done(function(args){
                args.should.have.property('rev_summary');
                done();
            });*/
        });
    });

    /*describe('testing create of root page',function(){
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
    });*/

    /*describe('testing create default design document',function(){
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
    });*/

    /*after(function(done){
        f.deletedb({
            host:setting.host
          , dbname:setting.dbname
          , cookie:cookie
        })
        .done(function(args){
            done();
        });
    });*/
});

