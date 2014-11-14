'use strict';

module.exports=function(params,repeat,stop,notifier){
    if(notifier){
        notifier('notification','exclusive',{});
    }else{
        console.log('exclusive task in: '+Date.now());
    }
    repeat();
};


module.exports.schema={
    'type':'object'
  , 'properties':{}
};

