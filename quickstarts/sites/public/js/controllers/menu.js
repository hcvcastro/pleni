'use strict';

pleni.controller('MenuController',
    ['$scope','$rootScope','$http','$location','$window',
    function($scope,$rootScope,$http,$location,$window){

        $scope.items=[1,0,0,0,0,0,1];

        $scope.menu=function(){
            var hash=window.location.hash.substring(1);

            switch(hash){
                case '/about':
                    $scope.items=[1,0,0,0,0,1,0];
                    break;
                case '/map':
                    $scope.items=[1,0,0,0,1,0,1];
                    break;
                case '/sites':
                    $scope.items=[1,0,0,0,0,0,1];
            }

            pushy.togglePushy();
        }

        $scope.hide=function(){
            pushy.togglePushy();
        }

        $scope.about=function(){
            pushy.togglePushy();
            $location.path('about');
        }

        $scope.home=function(){
            pushy.togglePushy();
            $location.path('');
        }

        $scope.close=function(){
            pushy.togglePushy();
            $http.delete('/').success(function(){
                $location.path('sites');
                $window.location.reload();
            });
        };

        $scope.report=function(){}
        $scope.export=function(){}
        $scope.more=function(){}

        $scope.refresh=function(){
            $window.location.reload();
        }
}]);

