'use strict';

var request=require('supertest')
  , should=require('should')
  , join=require('path').join
  , app=require('../../master/app')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , loadconfig=require('../../master/utils/loadconfig')

describe('workspace controller functions',function(){
    describe('rest functions for collection',function(){
        it('GET /workspace/view',function(done){
            request(app)
                .get('/workspace/view')
                .expect(200,done);
        });

        it('GET /workspace/:project/:repository',function(done){
            request(app)
                .get('/workspace/test/test')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.property('_id');
                    res.body.should.have.property('_rev');
                    res.body.should.have.property('type');
                    res.body.should.have.property('url');
                    done();
                });
        });
    });
});

