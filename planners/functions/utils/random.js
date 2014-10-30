'use strict';

var Q=require('q')
  , sha1=require('sha1')

/*
 * Function for random generator
 * args inputs
 *
 * args outputs
 *      random
 */
exports.generator=function(args){
    var deferred=Q.defer()
      , random=generator()

    args.random=sha1(random);

    deferred.resolve(args);
    return deferred.promise;
};

var generator=function(low,high){
    var _low=low||0
      , _high=high||1024

    return Math.floor(Math.random()*(_high-_low)+_low);
};
exports.sync=generator;

