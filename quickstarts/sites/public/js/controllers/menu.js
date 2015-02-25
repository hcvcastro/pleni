'use strict';

pleni.controller('MenuController',['$scope','$rootScope','$http','$location',
    function($scope,$rootScope,$http,$location){
        $scope.init=function(){
            var match=/pleni.url=(.+)/.exec(document.cookie)
              , site='/sites'
              , location=$location.path()||site

            if(match&&match.length==2){
                site='/map';
            }

            $scope.items={
                more:(site=='/map')
              , mapsite:(site=='/map')
              , report:(site=='/map')
              , close:(site=='/map')
              , home:(location=='/about')
              , about:(location!='/about')
            };
        };

        $scope.menu=function(){
            $scope.init();
            pushy.togglePushy();
        }

        $scope.home=function(){
            $scope.items.home=false;
            pushy.togglePushy();
            return $location.path('/');
        }

        $scope.about=function(){
            $scope.items.home=true;
            pushy.togglePushy();
            return $location.path('/about');
        }

        $scope.init();
}]);

