'use strict';

module.exports=function(params,repeat,stop,notifier){
    notifier({
        action:'task'
      , task:{
            id:'exclusive'
          , msg:'tick'
        }
    });
    repeat();
};


module.exports.schema={
    'type':'object'
  , 'properties':{}
};

