'use strict';

var request=require('supertest')
  , should=require('should')
  , planners=require('../../server/sites/planners')
  , config=require('../../config/tests')

describe('quickstart sites planners tasks functions',function(){
    before(function(done){
        require('../../server/planner.io');
        done();
    });

    it('create repository - quickstart sites',function(done){
        var planner='http://localhost:3001'
          , db={
                host:config.db.host+':'+config.db.port
              , name:'pleni_site_qs_1'
              , user:config.db.user
              , pass:config.db.pass
            };
        planners.create(planner,db,'http://galao.local',function(){
            setTimeout(done,2000);
        });
    });

    it('fetch repository - quickstart sites',function(done){
        var planner='http://localhost:3001'
          , db={
                host:config.db.host+':'+config.db.port
              , name:'pleni_site_qs_1'
              , user:config.db.user
              , pass:config.db.pass
            };
        planners.fetch(planner,db,'',function(){
            setTimeout(done,4000);
        });
    });
});

