'use strict';

pleni.controller('SocketController',
    ['$scope','$sessionStorage','Socket',
    function($scope,$sessionStorage,Socket){
        $scope.storage=$sessionStorage;

        Socket.on('notifier',function(msg){
            console.log(msg);
        });
    }]
);

