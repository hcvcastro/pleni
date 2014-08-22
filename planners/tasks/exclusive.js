'use strict';

module.exports=function(params,repeat,stop){
    console.log('task in: '+Date.now());
    repeat();
};

module.exports.cleanargs=function(args){
    return {};
};

module.exports.args={};

