'use strict';

module.exports=function(params,repeat,stop,notifier){
    notifier({
        task:{
            action:'tick'
        }
    });
    repeat();
};


module.exports.schema={
    'type':'object'
  , 'properties':{}
};

