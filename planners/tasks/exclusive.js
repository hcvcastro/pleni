'use strict';

module.exports=function(params,repeat,stop,notifier){
    notifier({
        action:'task'
      , task:{
            msg:'tick'
        }
    });
    repeat();
};


module.exports.schema={
    'type':'object'
  , 'properties':{}
};

