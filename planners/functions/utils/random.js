'use strict';

var Q=require('q')
  , sha1=require('sha1')
  , uuid=require('node-uuid')

/*
 * Function for random generator
 * args output
 *      random
 */
module.exports=function(args){
    var deferred=Q.defer()
      , random=generator()

    args.random=sha1(random);

    deferred.resolve(args);
    return deferred.promise;
};

var generator=function(){
    return uuid.v4();
};
module.exports.sync=generator;

