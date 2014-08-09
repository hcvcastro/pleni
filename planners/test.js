'use strict';

var f=require('./functions');

console.log('testing of couchdb');

f.testcouchdb({host:'http://localhost:5984'})
.fail(function(error){
    console.log('FAIL');
    console.log(error);
})
.done(function(args){
    console.log('OK');
})

