'use strict';

pleni.controller('NotifierController',
    ['$scope','$sessionStorage','$http','Planners','Notifiers','Socket','Visual',
    function($scope,$sessionStorage,$http,Planners,Notifiers,Socket,Visual){
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
                $scope.thread=undefined;
                $scope.current=undefined;
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

        $scope.clean=function(){
            Notifiers.clean({server:'master'},function(){
                $scope.storage.planners.forEach(function(planner){
                    planner.follow=false;
                });
            },function(error){
                utils.show('error',error);
            });
        }

        var process_planner=function(thread,pkg){
            var i=thread[0]
              , sel=$scope.storage.threads[i]

            switch(pkg.planner.action){
                case 'connection':
                    break;
                case 'create':
                    sel.set={
                        status:'set'
                      , name:pkg.planner.task.id
                      , count:pkg.planner.task.count
                      , interval:pkg.planner.task.interval
                    };
                    break;
                case 'remove':
                    sel.set={
                        status:'unset'
                      , name:''
                      , count:undefined
                      , interval:undefined
                    };
                    sel.msg='';
                    break;
                case 'run':
                    sel.status='running';
                    $scope.storage.planners[get_element(
                        thread[1].id,$scope.storage.planners)[0]
                    ].status='running';
                    break;
                case 'stop':
                    sel.status='stopped';
                    $scope.storage.planners[get_element(
                        thread[1].id,$scope.storage.planners)[0]
                    ].status='stopped';
                    break;
                case 'task':
                    switch(pkg.planner.task.id){
                        case 'site/fetch':
                            var node=pkg.planner.task.msg.node
                              , repository=$scope.storage.workspace.repository

                            sel.msg='GET '+node.page+' '+node.statuscode+
                                '. links found: '+node.rels.length;

                            if(repository==pkg.params.repository){
                                Visual.add({
                                    page:node.page
                                  , status:node.status
                                  , statuscode:node.statuscode
                                  , mimetype:node.mimetype
                                  , type:node.type
                                },node.rels);
                            }

                            break;
                        default:
                            sel.msg=pkg.planner.task.msg;
                    }
                    break;
            }
        };

        Socket.on('notifier',function(pkg){
            //console.log('socket.io',JSON.stringify(pkg));
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
                        $scope.message='';
                    }
                    break;
                case 'create':
                    var thread=get_element(pkg.msg.id,$scope.storage.threads);
                    if(!thread){
                        $scope.storage.threads.push(create_thread(pkg.msg));
                    }
                    break;
                case 'connection':
                    break;
                case 'planner':
                    var thread=get_element(pkg.id,$scope.storage.threads)
                    if(thread){
                        process_planner(thread,pkg);
                    }
                    break;
            }
        });

        $scope.init();
    }]
);

