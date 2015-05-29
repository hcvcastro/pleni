'use strict';

pleni.factory('Clients',['$resource',function($resource){
    return $resource('/resources/clients/:client/:action',{
        client:'@client'
      , action:'@action'
    },{
        update:{method:'PUT'}
    });
}]);

