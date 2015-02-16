'use strict';

pleni.controller('SocketController',['$scope','Socket',function($scope,Socket){
    $scope.menu=function(){
        pushy.togglePushy();
    }
}]);

