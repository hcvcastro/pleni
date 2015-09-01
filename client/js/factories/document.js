'use strict';

pleni.factory('Document',['$http',function($http){
    return {
        get:function(project,repository,document,success,failure){
            var params=['workspace',project,repository,document];

            $http.get(params.join('/')).then(success,failure);
        }
    };
}]);

