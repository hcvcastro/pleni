'use strict';

var count=0;

module.exports=function(params,repeat,stop,notifier){
    notifier({
        action:'task'
      , task:{
            id:'exclusive'
          , msg:'loop: '+(count++)
        }
    });
    repeat();
};


module.exports.schema={
    'type':'object'
  , 'properties':{}
};

