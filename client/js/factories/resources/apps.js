'use strict';

pleni.factory('Apps',['$resource',function($resource){
    return $resource('/resources/apps/:app/:action',{
        app:'@app'
      , action:'@action'
    },{
        update:{method:'PUT'}
    });
}]);

