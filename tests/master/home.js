'use strict';

var request=require('supertest')
  , should=require('should')
  , app=require('../../master/app')

describe('home controller functions',function(){
    it('GET /',function(done){
        request(app)
            .get('/')
            .expect(200,done);
    });
    it('GET /home',function(done){
        request(app)
            .get('/home')
            .expect(200,done);
    });
});

