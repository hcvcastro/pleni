'use strict';

var request=require('supertest')
  , assert=require('assert')
  , app=require('../server/app');

describe('home',function(){
    describe('home controller functions',function(){
        it('GET /',function(done){
            request(app).get('/').expect(200,done);
        });
        it('GET /home',function(done){
            request(app).get('/home').expect(200,done);
        });
    });
});

