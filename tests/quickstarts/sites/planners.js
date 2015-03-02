'use strict';

var request=require('supertest')
  , should=require('should')
  , planners=require('../../../quickstarts/sites/planners')

describe('quickstart sites planners tasks functions',function(){
    it('create repository - quickstart sites',function(done){
        var pkg={
                host:'http://localhost'
              , port:3001
            }
          , db={
                host:'http://localhost:5984'
              , name:'pleni_site_qs_1'
              , user:'jacobian'
              , pass:'asdf'
            };
        planners.create(pkg,db,'http://galao.local',function(){
            setTimeout(done,5000);
        });
    });

    it('fetch repository - quickstart sites',function(done){
        var pkg={
                host:'http://localhost'
              , port:3001
            }
          , db={
                host:'http://localhost:5984'
              , name:'pleni_site_qs_1'
              , user:'jacobian'
              , pass:'asdf'
            };
        planners.fetch(pkg,db,function(){
            setTimeout(done,10000);
        });
    });

    after(function(){
        console.log('after mocha test');
    });
});

