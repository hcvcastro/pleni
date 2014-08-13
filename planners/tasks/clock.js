'use strict';

module.exports=function(params,repeat,stop){
    console.log('task in: '+Date.now());
    repeat();
};

module.exports.valid=function(args){
    return true;
};

