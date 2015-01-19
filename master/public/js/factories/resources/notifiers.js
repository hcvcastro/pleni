'use strict';

pleni.factory('Notifiers',['$resource',function($resource){
    return $resource('/resources/notifiers/:notifier/:action',{
        notifier:'@server'
      , action:'@action'
    },{
        update:{method:'PUT'}
      , check:{method:'POST',params:{action:'_check'}}
      , get:{method:'POST',params:{action:'_get'}}
      , add:{method:'POST',params:{action:'_add'}}
      , remove:{method:'POST',params:{action:'_remove'}}
      , clean:{method:'POST',params:{action:'_clean'}}
    });
}]);

