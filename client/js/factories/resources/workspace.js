'use strict';

pleni.factory('Workspace',['$resource',function($resource){
    return $resource('/workspace/:project/:repository/:document',{
        project:'@project'
      , repository:'@repository'
      , document:'@document'
    },{
        summarize:{method:'POST',params:{document:'summarize'}}
      , remove:{method:'POST',params:{document:'remove'}}
    });
}]);

