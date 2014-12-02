'use strict';

pleni.factory('DBServers',['$resource',function($resource){
    return $resource('/resources/dbservers/:dbserver/:action',{
        dbserver:'@dbserver'
      , action:'@action'
    },{
        update:{method:'PUT'}
      , check:{method:'POST',params:{action:'_check'}}
      , scan:{method:'POST',params:{action:'_databases'},isArray:true}
    });
}]);

pleni.factory('Repositories',['$resource',function($resource){
    return $resource('/resources/repositories/:repository/:action',{
        repository:'@repository'
      , action:'@action'
    },{
        update:{method:'PUT'}
      , check:{method:'POST',params:{action:'_check'}}
    });
}]);

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
      , unset:{method:'DELETE',params:{action:'_unset'}}
      , run:{method:'POST',params:{action:'_run'}}
      , stop:{method:'POST',params:{action:'_stop'}}
    });
}]);

