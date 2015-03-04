'use strict';

pleni.factory('Projects',['$resource',function($resource){
    return $resource('/projects/:project/:action',{
        project:'@project'
      , action:'@action'
    },{
        update:{method:'PUT'}
    });
}]);

