'use strict';

module.exports=function(params,repeat,stop){
    console.log('exclusive task in: '+Date.now());
    repeat();
};


module.exports.schema={
    'type':'object'
  , 'properties':{}
};

