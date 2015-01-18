'use strict';

pleni.controller('WorkspaceController',
    ['$scope','$routeParams','$location','$sessionStorage','$http',
    function($scope,$routeParams,$location,$sessionStorage,$http){
        $scope.storage=$sessionStorage;

        var get_element=function(needle,haystack){
                for(var i in haystack){
                    if(haystack[i].id==needle){
                        return [i,haystack[i]];
                    }
                }
                return;
            }
          , project=$routeParams.project
          , repositories=get_element(project,$scope.storage.projects)[1]

        $scope.storage.workspace={
            name:project
          , repositories:repositories._repositories
          , settings:true
        };

        $scope.workspace={
            close:function(){
                delete $scope.storage.workspace;
                $location.path('/projects');
            }
        };
    }]
);

