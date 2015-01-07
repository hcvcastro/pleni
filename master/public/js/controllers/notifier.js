'use strict';

pleni.controller('SocketController',
    ['$scope','$sessionStorage','$http','Planners','Socket',
    function($scope,$sessionStorage,$http,Planners,Socket){
        $scope.storage=$sessionStorage;
        $scope.storage.threads=[];

        $scope.thread=undefined;
        $scope.index=undefined;
        $scope.message='';

        var get_element=function(needle,haystack){
                for(var i in haystack){
                    if(haystack[i].id==needle){
                        return [i,haystack[i]];
                    }
                }
                return;
            }
          , create_thread=function(element){
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

                Planners.check({server:element.id},function(){
                    pkg.check='online';
                    Planners.status({server:element.id},function(i){
                        pkg.status=i.planner.status;
                        Planners.isset({server:element.id},function(j){
                            if(j.planner.result){
                                Planners.get({server:element.id},function(k){
                                    pkg.set.status='set';
                                    pkg.set.name=k.planner.task.name;
                                    pkg.set.count=k.planner.task.count;
                                    pkg.set.interval=k.planner.task.interval;
                                });
                            }else{
                                pkg.set.status='unset';
                            }
                        });
                    });
                });
                
                return pkg;
            }

        $scope.init=function(){
            $http.get('/notifier').success(function(data){
                $scope.storage.threads=data.map(create_thread);
            });
        };

        $scope.pick=function(index){
            if(index==$scope.index){
                $scope.index=undefined;
                $scope.thread=undefined;
            }else{
                $scope.index=index;
                $scope.thread=$scope.storage.threads[index];
            }
        }

        $scope.stop=function(){
            console.log('stopped current planner');
        }

        Socket.on('notifier',function(pkg){
            switch(pkg.action){
                case 'put':
                case 'delete':
                    $scope.init();
                    break;
                case 'update':
                case 'remove':
                    var thread=get_element(pkg.msg.id,$scope.storage.threads);
                    if(thread){
                        $scope.storage.threads.splice(thread[0],1);
                    }
                    if(pkg.action=='remove'){
                        break;
                    }
                case 'update':
                case 'create':
                    $scope.storage.threads.push(create_thread(pkg.msg));
                    break;
                default:
                    console.log(pkg);
                    break;
            }
        });
        $scope.init();
    }]
);

