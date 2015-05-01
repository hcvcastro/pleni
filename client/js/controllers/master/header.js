'use strict';

pleni.controller('HeaderController',
    ['$scope','$sessionStorage','$http','$window',
    function($scope,$sessionStorage,$http,$window){
        $scope.storage=$sessionStorage;

        $scope.signout=function(){
            $http.post('/signout')
            .success(function(data){
                utils.show('success','Redirecting to signin page');
                $window.location.href='/#/signin';
            })
            .error(function(error){
                utils.show('error','Invalid request');
            });
        }
    }]
);

