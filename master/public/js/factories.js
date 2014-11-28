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

