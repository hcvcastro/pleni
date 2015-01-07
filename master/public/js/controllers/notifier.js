'use strict';

pleni.controller('SocketController',
    ['$scope','$sessionStorage','$http','Socket',
    function($scope,$sessionStorage,$http,Socket){
        $scope.storage=$sessionStorage;
        $scope.threads=[];

        $scope.init=function(){
            $http.get('/notifier').success(function(data){
                $scope.threads=data;
            });
        };

        Socket.on('notifier',function(msg){
            console.log(msg);
        });
        $scope.init();
    }]
);

