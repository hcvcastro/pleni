'use strict';

var request=require('supertest')
  , assert=require('assert')
  , app=require('../server/app');

describe('settings',function(){
    describe('settings controller functions',function(){
        it('GET /settings',function(done){
            request(app)
                .get('/settings')
                .expect(200,done);
        });
        it('POST /settings/testdb',function(done){
            var cases=[
                {test:{},expected:{id:1}},
                {test:{id:1},expected:{id:1}}
            ];

            for(var item in cases){
                request(app)
                    .post('/settings/testdb')
                    .send(cases[item].test)
                    .expect('Content-Type',/json/)
                    .expect(200)
                    .end(function(err,res){
                        var result=JSON.parse(res.text);
                        assert.equal(
                            JSON.stringify(result),
                            JSON.stringify(cases[item].expected)
                        );
                    });
            }

            done();
        });
    });
});

