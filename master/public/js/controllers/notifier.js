'use strict';

pleni.controller('SocketController',['$scope','Socket',function($scope,Socket){
    Socket.on('notifier',function(msg){
        console.log(msg);
    });
}]);

