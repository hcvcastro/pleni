'use strict';

pleni.controller('SocketController',
    ['$scope','$sessionStorage','$http','Planners','Socket',
    function($scope,$sessionStorage,$http,Planners,Socket){
        $scope.storage=$sessionStorage;
        $scope.storage.threads=[];

        $scope.thread=undefined;
        $scope.current=undefined;
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
                  , msg:''
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
            if(index==$scope.current){
                $scope.current=undefined;
                $scope.thread=undefined;
            }else{
                $scope.current=index;
                $scope.thread=$scope.storage.threads[$scope.current];
            }
        }

        $scope.stop=function(){
            Planners.stop({server:$scope.thread.id},function(){
            },function(error){
                utils.show('error',error);
            });
        }

        Socket.on('notifier',function(pkg){
            switch(pkg.action){
                case 'put':
                case 'delete':
                    $scope.init();
                    break;
                case 'remove':
                    var thread=get_element(pkg.msg.id,$scope.storage.threads);
                    if(thread){
                        $scope.storage.threads.splice(thread[0],1);
                        $scope.current=undefined;
                        $scope.thread=undefined;
                    }
                    break;
                case 'create':
                    $scope.storage.threads.push(create_thread(pkg.msg));
                    break;
                case 'connection':
                    break;
                case 'planner':
                    var thread=get_element(pkg.id,$scope.storage.threads)
                    if(thread){
                        var i=thread[0];
                        switch(pkg.planner.action){
                            case 'connection':
                                break;
                            case 'create':
                                $scope.storage.threads[i].set={
                                    status:'set'
                                  , name:pkg.planner.task.name
                                  , count:pkg.planner.task.count
                                  , interval:pkg.planner.task.interval
                                };
                                break;
                            case 'remove':
                                $scope.storage.threads[i].set={
                                    status:'unset'
                                  , name:''
                                  , count:undefined
                                  , interval:undefined
                                };
                                break;
                            case 'run':
                                $scope.storage.threads[i].status='running';
                                $scope.storage.planners[get_element(
                                    thread[1].id,$scope.storage.planners)[0]
                                ].status='running';
                                break;
                            case 'stop':
                                $scope.storage.threads[i].status='stopped';
                                $scope.storage.planners[get_element(
                                    thread[1].id,$scope.storage.planners)[0]
                                ].status='stopped';
                                break;
                            case 'task':
                                if($scope.storage.threads[i].set.count>0){
                                    $scope.storage.threads[i].set.count--;
                                }
                                $scope.storage.threads[i].msg
                                    =pkg.planner.task.msg;
                                break;
                        }
                    }
                    break;
            }
        });

        $scope.init();
    }]
);

