'use strict';

var request=require('supertest')
  , should=require('should')
  , app=require('../../../quickstarts/sites/app')
  , _success=require('../../../planners/utils/json-response').success
  , _error=require('../../../planners/utils/json-response').error

describe('quickstart sites controller functions',function(){
    it('GET /',function(done){
        request(app)
            .get('/')
            .expect(200,done);
    });

    it('GET /sites',function(done){
        request(app)
            .get('/sites')
            .expect(200,done);
    });
});

