'use strict';

pleni.controller('WorkspaceController',
    ['$scope','$routeParams','$location','$sessionStorage',
    'Resources','Projects',
    function($scope,$routeParams,$location,$sessionStorage,Resources,Projects){
        $scope.storage=$sessionStorage;

        if(!$routeParams.project){
            $location.path('/projects');
        }

        $scope.storage.workspace={
            name:$routeParams.project
          , api:{}
        };

        $scope.workspace={
            env:{
                panel:''
            }
          , init:function(){
                Projects.get({
                    project:$scope.storage.workspace.name
                },function(data){
                    $scope.storage.workspace.repositories=data._repositories;
                },function(error){});

                $scope.planners.load();
                if(!$scope.storage.workspace.planners){
                    $scope.workspace.settings();
                }
            }
          , exit:function(){
                delete $scope.storage.workspace;
                $location.path('/projects');
            }
          , settings:function(){
                $scope.workspace.env.panel='settings';
            }
          , close:function(){
                $scope.workspace.env.panel='';
            }
          , icon:function(name){
                return 'fa-pleni-'+name.replace('/','-');
            }
        };

        $scope.planners={
            load:function(){
                Resources.planners.load(function(data){
                    for(var index in $scope.storage.planners){
                        $scope.planners.check(index);
                    }
                });
            }
          , follow:function(index){
                var planner=$scope.storage.planners[index]
                  , notifier='master'

                if(planner.follow){
                    Resources.notifiers.remove({
                        server:notifier
                      , planner:planner.id
                    },function(data){
                        $scope.storage.planners[index].follow=false;
                    },function(error){});
                }else{
                    Resources.notifiers.add({
                        server:notifier
                      , planner:planner.id
                    },function(data){
                        $scope.storage.planners[index].follow=true;
                    },function(error){});
                }
            }
          , check:function(index){
                var planner=$scope.storage.planners[index];

                planner.check='checking';
                Resources.planners.check({
                    server:planner.id
                },function(data){
                    planner.check='online';
                    planner.type=data.planner.type;

                    Resources.planners.status({
                        server:planner.id
                    },function(data){
                        planner.status=data.planner.status;
                    },function(error){
                        planner.status='unknown';
                    });

                    Resources.planners.isset({
                        server:planner.id
                    },function(data){
                        if(data.planner.result){
                            $scope.planners.get(index);
                        }else{
                            planner.set.status='unset';
                        }
                    },function(error){
                        planner.set.status='unknown';
                    });

                    Resources.planners.api({
                        server:planner.id
                    },function(data){
                        planner.api=data.planner.tasks;
                        planner.api.forEach(function(task){
                            if($scope.storage.workspace.api[task.name]){
                                $scope.storage.workspace
                                      .api[task.name].push(planner);
                            }else{
                                $scope.storage.workspace
                                      .api[task.name]=[planner];
                            }
                        });
                    },function(error){});
                },function(error){
                    planner.check='offline';
                });
            }
          , get:function(index){
                var planner=$scope.storage.planners[index];

                Resources.planners.get({
                    server:planner.id
                },function(data){
                    planner.set.status='set';
                    planner.set.name=data.planner.task.name;
                    planner.set.count=data.planner.task.count;
                    planner.set.interval=data.planner.task.interval;
                    if(planner.api){
                        for(var i=0;i<planner.api.length;i++){
                            if(planner.set.name==
                                planner.api[i].name){
                                planner.set.schema=planner.api[i].schema;
                                break;
                            }
                        }
                    }
//                    $scope.planners.editor();
                },function(error){});
            }
          , exclusive:function(index){
                var planner=$scope.storage.planners[index];

                Resources.planners.set({
                    server:planner.id
                  , task:{
                        name:'exclusive'
                      , count:1
                      , interval:500
                    }
                },function(data){
                    console.log(data);
                },function(error){
                    console.log(error);
                });
            }
        };

        $scope.workspace.init();
    }]
);

