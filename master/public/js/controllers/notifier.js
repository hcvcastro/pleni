'use strict';

pleni.controller('SocketController',
    ['$scope','$sessionStorage','$http','Planners','Socket',
    function($scope,$sessionStorage,$http,Planners,Socket){
        $scope.storage=$sessionStorage;
        $scope.storage.threads=[];

        $scope.thread=undefined;
        $scope.message='';

        $scope.init=function(){
            $http.get('/notifier').success(function(data){
                $scope.storage.threads=data.map(function(element){
                    var pkg={
                        id:element.id
                      , planner:{
                            host:element.planner.host
                          , port:element.planner.port
                        }
                      , check:'unknown'
                      , status:'unknown'
                      , set:{
                            status:'unknown'
                          , name:''
                          , count:undefined
                          , interval:undefined
                        }
                    };

                    Planners.check({server:element.id},function(data1){
                        pkg.check='online';
                        Planners.status({server:element.id},function(data2){
                            pkg.status=data2.planner.status;
                            Planners.isset({server:element.id},function(data3){
                                if(data3.planner.result){
                                    Planners.get({server:element.id},function(data4){
                                        pkg.set.status='set';
                                        pkg.set.name=data4.planner.task.name;
                                        pkg.set.count=data4.planner.task.count;
                                        pkg.set.interval=data4.planner.task.interval;
                                    },function(error){});
                                }else{
                                    pkg.set.status='unset';
                                }
                            },function(error){});
                        },function(error){});
                    },function(error){});
                    
                    return pkg;
                });
            });
        };

        Socket.on('notifier',function(msg){
            switch(msg.action){
                case 'add':
                    console.log($scope.threads);
                    console.log(msg.msg);
                    break;
            }
        });
        $scope.init();
    }]
);

