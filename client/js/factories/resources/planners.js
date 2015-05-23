'use strict';

pleni.factory('Planners',['$resource',function($resource){
    return $resource('/resources/planners/:planner/:action',{
        planner:'@server'
      , action:'@action'
    },{
        update:{method:'PUT'}
      , check:{method:'POST',params:{action:'_check'}}
      , status:{method:'POST',params:{action:'_status'}}
      , api:{method:'POST',params:{action:'_api'}}
      , tid:{method:'POST',params:{action:'_tid'}}
      , set:{method:'POST',params:{action:'_set'}}
      , get:{method:'POST',params:{action:'_get'}}
      , isset:{method:'POST',params:{action:'_isset'}}
      , unset:{method:'POST',params:{action:'_unset'}}
      , clean:{method:'POST',params:{action:'_clean'}}
      , run:{method:'POST',params:{action:'_run'}}
      , stop:{method:'POST',params:{action:'_stop'}}
    });
}]);

