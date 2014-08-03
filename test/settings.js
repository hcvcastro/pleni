'use strict';

var request=require('supertest')
  , assert=require('assert')
  , app=require('../server/app')
  , paqSuccess=require('../server/json-response').success
  , paqError=require('../server/json-response').error;

describe('settings',function(){
    describe('settings controller functions',function(){
        it('GET /settings',function(done){
            request(app)
                .get('/settings')
                .expect(200,done);
        });

        [
            {test:'',expected:paqError.validation},
            {test:{},expected:paqError.validation},
            {test:{id:1},expected:paqError.validation},
            {test:{host:'',port:''},expected:paqError.validation},
            {test:{host:'localhost',port:'79'},expected:paqError.network},
            {test:{host:'localhost',port:'80'},expected:paqError.connection},
            {test:{host:'localhost',port:'5984'},expected:paqSuccess.connection}
        ]
        .forEach(function(element){
            it('POST /settings/testdb',function(done){
                request(app)
                    .post('/settings/testdb')
                    .send(element.test)
                    .expect('Content-Type',/json/)
                    .expect(200)
                    .end(function(err,res){
                        assert.equal(
                            JSON.stringify(JSON.parse(res.text)),
                            JSON.stringify(element.expected)
                        );
                        done();
                    });
            });
        });

        [
            {test:'',expected:paqError.validation},
            {test:{},expected:paqError.validation},
            {test:{id:1},expected:paqError.validation},
            {test:{host:'',port:''},expected:paqError.validation},
            {test:{host:'localhost',port:'79'},expected:paqError.validation},
            {test:{host:'localhost',port:'80'},expected:paqError.validation},
            {test:{host:'localhost',port:'5984'},expected:paqError.validation},
            {test:{host:'localhost',port:'5984',prefix:''},
                expected:paqError.validation},
            {test:{host:'localhost',port:'5984',prefix:'112'},
                expected:paqError.validation},
        ]
        .forEach(function(element){
            it('POST /settings/savedb',function(done){
                request(app)
                    .post('/settings/savedb')
                    .send(element.test)
                    .expect('Content-Type',/json/)
                    .expect(200)
                    .end(function(err,res){
                        assert.equal(
                            JSON.stringify(JSON.parse(res.text)),
                            JSON.stringify(element.expected)
                        );
                        done();
                    });
            });
        });
    });
});

