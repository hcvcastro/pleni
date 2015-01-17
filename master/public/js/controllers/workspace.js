'use strict';

pleni.controller('WorkspaceController',
    ['$scope','$routeParams','$location','$sessionStorage','$http',
    function($scope,$routeParams,$location,$sessionStorage,$http){
        $scope.storage=$sessionStorage;
        $scope.storage.workspace={
            project:$routeParams.project
        };

        $scope.workspace={
            close:function(){
                delete $scope.storage.workspace;
                $location.path('/projects');
            }
        };
    }]
);

