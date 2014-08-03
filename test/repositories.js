'use strict';

var request=require('supertest')
  , assert=require('assert')
  , app=require('../server/app');

describe('repositories',function(){
    describe('repositores controller functions',function(){
        it('GET /repositories',function(done){
            request(app)
                .get('/repositories')
                .expect(200,done);
        });

        /*var messages1=[
            {result:false,message:'Validation error'},
            {result:false,message:'Network error'},
            {result:false,message:'Connection error'},
            {result:false,message:'JSON error'},
            {result:true,message:'Success connection',version:'1.6.0'}
        ];
        var cases1=[
            {test:'',expected:messages1[0]},
            {test:{},expected:messages1[0]},
            {test:{id:1},expected:messages1[0]},
            {test:{host:'',port:''},expected:messages1[0]},
            {test:{host:'localhost',port:'79'},expected:messages1[1]},
            {test:{host:'localhost',port:'80'},expected:messages1[2]},
            {test:{host:'localhost',port:'5984'},expected:messages1[4]}
        ];

        for(var item1 in cases1){
            it('POST /settings/testdb',function(done){
                request(app)
                    .post('/settings/testdb')
                    .send(cases1[item1].test)
                    .expect('Content-Type',/json/)
                    .expect(200)
                    .end(function(err,res){
                        assert.equal(
                            JSON.stringify(JSON.parse(res.text)),
                            JSON.stringify(cases1[item1].expected)
                        );
                        done();
                    });
            });
        }*/
    });
});

