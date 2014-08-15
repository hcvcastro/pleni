'use strict';

var request=require('supertest')
  , should=require('should')
  , app=require('../../master/app')
 
//  , validator=require('validator')
//  , paqSucces=require('../server/json-response').success
//  , paqError=require('../server/json-response').error;

describe('repositories controller functions',function(){
    it('GET /repositories/view',function(done){
        request(app)
            .get('/repositories/view')
            .expect(200,done);
    });

    it('GET /repositories',function(done){
        request(app)
            .get('/repositories')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                done();
            });
    });

    /*it('PUT /repositories',function(done){
        request(app)
            .put('/repositories')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                assert.equal(
                    JSON.stringify(JSON.parse(res.text)),
                    JSON.stringify(paqError.notimplemented)
                );
                done();
            });
    });*/

    /*[
        {test:'',expected:paqError.validation},
        {test:{},expected:paqError.validation},
        {test:{id:1},expected:paqError.validation},
        {test:{repository:''},expected:paqError.validation},
        {test:{repository:'1'},expected:paqError.validation},
        {test:{repository:'/'},expected:paqError.validation},
        {test:{repository:'...'},expected:paqError.validation},
    ]
    .forEach(function(element){
        it('POST /repositories',function(done){
            request(app)
                .post('/repositories')
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

    it('DELETE /repositories',function(done){
        request(app)
            .put('/repositories')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                assert.equal(
                    JSON.stringify(JSON.parse(res.text)),
                    JSON.stringify(paqError.notimplemented)
                );
                done();
            });
    });*/
});

