'use strict';

var request=require('supertest')
  , should=require('should')
  , planners=require('../../../server/sites/planners')

describe('quickstart sites planners tasks functions',function(){
    before(function(done){
        require('../../../server/planner.io');
        done();
    });

    it('create repository - quickstart sites',function(done){
        var planner='http://localhost:3001'
          , db={
                host:'http://localhost:5984'
              , name:'pleni_site_qs_1'
              , user:'jacobian'
              , pass:'asdf'
            };
        planners.create(planner,db,'http://galao.local',function(){
            setTimeout(done,1000);
        });
    });

    it('fetch repository - quickstart sites',function(done){
        var planner='http://localhost:3001'
          , db={
                host:'http://localhost:5984'
              , name:'pleni_site_qs_1'
              , user:'jacobian'
              , pass:'asdf'
            };
        planners.fetch(planner,db,'',function(){
            setTimeout(done,4000);
        });
    });
});

