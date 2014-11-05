'use strict';

module.exports=function(params,repeat,stop){
    console.log('exclusive task in: '+Date.now());
    repeat();
};


module.exports.clean=function(args){
    return {};
};

/*
module.exports.scheme={};
*/

