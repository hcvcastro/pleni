'use strict';

pleni.controller('WorkspaceController',
    ['$scope','$routeParams','$location','$sessionStorage',
    'Resources','Projects',
    function($scope,$routeParams,$location,$sessionStorage,Resouces,Projects){
        $scope.storage=$sessionStorage;

        if($routeParams.project){
            $scope.storage.workspace={
                name:$routeParams.project
            };
        }else{
            $scope.workspace.close();
        }

        $scope.workspace={
            close:function(){
                delete $scope.storage.workspace;
                $location.path('/projects');
            }
        };
    }]
);

