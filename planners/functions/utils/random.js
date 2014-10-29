'use strict';

var Q=require('q')
  , sha1=require('sha1')

/* args definition
 *      id
 */
exports.generatorid=function(args){
    var random=generator();
    args['random']=sha1(random);

    return args;
};

var generator=function(low,high){
    var _low=low||0
      , _high=high||1024

    return Math.floor(Math.random()*(_high-_low)+_low);
};

