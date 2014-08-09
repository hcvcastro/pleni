'use strict';

var assert=require('assert')
  , f=require('../planners/functions');

describe('planner functions',function(){
    describe('testing couchdb server',function(){

        it('couchdb server',function(done){
            f.testcouchdb({host:'http://localhost:5894'})
            .fail(function(error){
                done();
            })
            .done(function(args){
                done();
            })
        });
        
    });
});

