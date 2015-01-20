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
          , panel:'settings'
        };

        $scope.workspace={
            init:function(){
                Projects.get({
                    project:$scope.storage.workspace.name
                },function(data){
                    $scope.storage.workspace.repositories=data._repositories;
                },function(error){});
            }
          , close:function(){
                delete $scope.storage.workspace;
                $location.path('/projects');
            }
          , accept:function(){
                console.log('accept');
            }
          , cancel:function(){
                console.log('cancel');
            }
        };

        $scope.planners={
            load:function(){
                Resources.planners.load(function(data){
                    $scope.storage.planners.forEach(function(planner){
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
                                    $scope.planners.get();
                                }else{
                                    planner.set.status='unset';
                                }
                            },function(error){
                                planner.set.status='unknown';
                            });
                        },function(error){
                            planner.check='offline';
                        });
                    });
                });
            }
          , follow:function(index){
                console.log('follow instruction');
            }
          , check:function(index){
                console.log('check instruction');
            }
          , exclusive:function(index){
                console.log('exclusive instruction');
            }
        };

        $scope.workspace.init();
        $scope.planners.load();
    }]
);

