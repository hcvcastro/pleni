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

        $scope.ui={
            planner:[]
          , task:{}
        }

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
                switch($scope.workspace.env.panel){
                    case '':
                        $scope.workspace.env.panel='settings';
                        break;
                    case 'settings':
                        $scope.workspace.close();
                        break;
                }
            }
          , close:function(){
                $scope.workspace.env.panel='';
            }
          , icon:function(name){
                return 'fa-pleni-'+name.replace('/','-');
            }
          , planners:{
                enter:function(index){
                    for(var i in $scope.storage.workspace.api){
                        $scope.ui.task[i]=$scope.storage.planners[index].api
                            .some(function(element){
                                return element.name==i;
                            });
                    }
                }
              , leave:function(){
                    for(var i in $scope.ui.task){
                        $scope.ui.task[i]=false;
                    }
                }
            }
          , tasks:{
                enter:function(task){
                    for(var i in $scope.storage.planners){
                        $scope.ui.planner[i]=$scope.storage.planners[i].api
                            .some(function(element){
                                return element.name==task;
                            });
                    }
                }
              , leave:function(){
                    for(var i in $scope.ui.planner){
                        $scope.ui.planner[i]=false;
                    }
                }
            }
        };

        $scope.planners={
            load:function(){
                Resources.planners.load(function(data){
                    for(var index in $scope.storage.planners){
                        $scope.planners.check(index);
                        $scope.ui.planner.push(false);
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
                                $scope.ui.task[task.name]=false;
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
                    /*if(planner.api){
                        for(var i=0;i<planner.api.length;i++){
                            if(planner.set.name==
                                planner.api[i].name){
                                planner.set.schema=planner.api[i].schema;
                                break;
                            }
                        }
                    }*/
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

