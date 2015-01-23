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
          , available:{}
          , enabled:{}
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
                $scope.workspace.env.panel='';

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
                    for(var i in $scope.storage.workspace.available){
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

                    $scope.planners.isset(index);

                    Resources.planners.api({
                        server:planner.id
                    },function(data){
                        planner.api=data.planner.tasks;
                        planner.api.forEach(function(task){
                            if($scope.storage.workspace.available[task.name]){
                                $scope.storage.workspace
                                      .available[task.name].push(planner);
                            }else{
                                $scope.storage.workspace
                                      .available[task.name]=[planner];
                                $scope.ui.task[task.name]=false;
                            }
                        });
                    },function(error){});
                },function(error){
                    planner.check='offline';
                });
            }
          , isset:function(index){
                var planner=$scope.storage.planners[index];

                Resources.planners.isset({
                    server:planner.id
                },function(data){
                    if(data.planner.result){
                        $scope.planners.get(index);
                    }else{
                        planner.set.status='unset';
                        for(var i in $scope.storage.workspace.enabled){
                            $scope.storage.workspace.enabled[i]=
                                $scope.storage.workspace.enabled[i]
                                    .filter(function(element){
                                        return element.id!=planner.id;
                                    });
                            if($scope.storage.workspace.enabled[i].length==0){
                                delete $scope.storage.workspace.enabled[i];
                            }
                        }
                    }
                },function(error){
                    planner.set.status='unknown';
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
                    planner.api.forEach(function(task){
                        if($scope.storage.workspace.enabled[task.name]){
                            $scope.storage.workspace
                                .enabled[task.name].push(planner);
                        }else{
                            $scope.storage.workspace
                                .enabled[task.name]=[planner];
                        }
                    });
                },function(error){});
            }
          , exclusive:function(index){
                var planner=$scope.storage.planners[index];

                switch(planner.set.status){
                    case 'unset':
                        planner.set.status='setting';
                        Resources.planners.set({
                            server:planner.id
                          , task:{
                                name:'exclusive'
                              , count:1
                              , interval:500
                            }
                        },function(data){
                            $scope.planners.get(index);
                        },function(error){
                            planner.set.status='unknown';
                            utils.show('error',error.data.message);
                        });
                        break;
                    case 'set':
                        planner.set.status='setting';
                        Resources.planners.unset({
                            server:planner.id
                        },function(data){
                            $scope.planners.isset(index);
                        },function(error){
                            console.log(error);
                        });
                        break;
                }
            }
        };

        $scope.workspace.init();
    }]
);

