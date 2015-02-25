'use strict';

pleni.controller('MenuController',['$scope','$rootScope','$http','$location',
    function($scope,$rootScope,$http,$location){
        var l=$location.path();

        $scope.items={
            more:(l=='/map')
          , mapsite:(l=='/map')
          , report:(l=='/map')
          , close:(l=='/map')
          , about:(l!='/map')
        };
        
        $scope.about=function(){
            pushy.togglePushy();
            return $location.path('about');
        }
}]);

