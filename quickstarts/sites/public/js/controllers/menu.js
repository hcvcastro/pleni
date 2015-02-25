'use strict';

pleni.controller('MenuController',['$scope','$rootScope','$http','$location',
    function($scope,$rootScope,$http,$location){
        $scope.items=[0,0,0,0,0,1];

        $scope.menu=function(){
            var hash=window.location.hash.substring(1);

            switch(hash){
                case '/about':
                    $scope.items=[0,0,0,0,1,0];
                    break;
                case '/map':
                    $scope.items=[1,1,1,1,0,1];
                    break;
                case '/sites':
                    $scope.items=[0,0,0,0,0,1];
            }

            pushy.togglePushy();
        }

        $scope.hide=function(){
            pushy.togglePushy();
        }

        $scope.about=function(){
            pushy.togglePushy();
            return $location.path('/about');
        }

        $scope.home=function(){
            pushy.togglePushy();
            return $location.path('/');
        }

        $scope.close=function(){
            console.log('close session');
        };

        $scope.report=function(){}
        $scope.export=function(){}
        $scope.more=function(){}
}]);

