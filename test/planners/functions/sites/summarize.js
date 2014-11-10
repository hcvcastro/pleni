'use strict';

var should=require('should')
  , base='../../../../planners/functions'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
  , create=require(base+'/databases/create')
  , summary=require(base+'/repositories/sites/create/summary')
  , rootsite=require(base+'/repositories/sites/create/rootsite')
  , design=require(base+'/repositories/sites/create/designdocument')
  , design2=require(base+'/repositories/sites/summarize/designdocument')
  , timestamp=require(base+'/repositories/sites/summarize/gettimestampdocument')
  , summary2=require(base+'/repositories/sites/summarize/getsummary')
  , summarize=require(base+'/repositories/sites/summarize/summarize')
  , remove=require(base+'/databases/remove')

var host='http://localhost:5984'
  , user='jacobian'
  , pass='asdf'
  , name='test'
  , url='http://galao.local'

describe('site fetcher pages functions',function(){
    var packet;

    before(function(done){
        auth({
            db:{
                host:host
              , user:user
              , pass:pass
              , name:name
            }
          , site:{
                url:url
            }
        })
       .then(create)
       .then(summary)
       .then(rootsite)
       .then(design)
        .done(function(args){
            packet=args;
            done();
        });
    });

    describe('testing for summarize a site',function(){
        it('push a document design timestamp',function(done){
            auth({
                db:{
                    host:host
                  , user:user
                  , pass:pass
                  , name:name
                }
            })
            .then(design2)
            .then(timestamp)
            .then(summary2)
            .then(summarize)
            .done(function(args){
                args.site.should.have.property('design');
                args.site.design.should.have.property('timestamp');
                done();
            });
        });
    });

    after(function(done){
        remove(packet)
        .done(function(args){
            done();
        });
    });
});

