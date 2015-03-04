'use strict';

pleni.factory('Repositories',['$resource',function($resource){
    return $resource('/resources/repositories/:repository/:action',{
        repository:'@repository'
      , action:'@action'
    },{
        update:{method:'PUT'}
      , check:{method:'POST',params:{action:'_check'}}
    });
}]);

