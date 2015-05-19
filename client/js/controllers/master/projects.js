'use strict';

pleni.controller('ProjectsController',
    ['$scope','$location','$sessionStorage','Resources','$filter',
    function($scope,$location,$sessionStorage,Resources,$filter){
        utils.set_tab(0,3);
        utils.set_header(true);

        $scope.storage=$sessionStorage;

        if($scope.storage.workspace){
            $location.path('/projects/'+$scope.storage.workspace.name);
        }

        var get_element=function(needle,haystack){
                for(var i in haystack){
                    if(haystack[i].id==needle){
                        return [i,haystack[i]];
                    }
                }
                return;
            };

        $scope.project={
            id:''
          , _repositories:new Array()
        }

        $scope.projects={
            env:{
                view:'list'
              , type:'collection'
            }
          , show:function(){
                utils.set_active('projects',1);
                if(!$scope.storage.projects){
                    $scope.projects.refresh();
                }
            }
          , refresh:function(){
                utils.load_projects_start();
                Resources.projects.load(utils.load_projects_end());
            }
          , implode:function(glue,pieces){
                return pieces.map(function(element){
                    return $filter('truncate')(element,16);
                }).join(glue);
            }
          , save:function(){
                utils.clean();
                if($scope.projects.env.type=='collection'){
                    utils.send('Saving project settings ...');
                    Resources.projects.create($scope.project,function(data){
                        $scope.projects.refresh();
                        $scope.projects.list();
                        utils.receive();
                        utils.show('success','Project added to the list');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }else if($scope.projects.env.type=='element'){
                    utils.send('Updating project settings ...');
                    Resources.projects.update({
                        project:$scope.project.id
                      , id:$scope.project.id
                      , _repositories:$scope.project._repositories
                    },function(data){
                        $scope.projects.refresh();
                        $scope.projects.list();
                        utils.receive();
                        utils.show('success','Project updated');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }
            }
          , repositories:{
                add:function(index){
                    var repository=$scope.storage.repositories[index].id;
                    if($scope.project._repositories.indexOf(repository)<0){
                        $scope.project._repositories.push(repository);
                    }else{
                        utils.show('warning','The repository already chosen');
                    }
                }
              , remove:function(index){
                    $scope.project._repositories.splice(index,1);
                }
            }
          , list:function(){
                $scope.projects.env.view='list';
            }
          , add:function(){
                $scope.projects.env.view='form';
                $scope.projects.env.type='collection';
            }
          , edit:function(index){
                $scope.projects.env.view='form';
                $scope.projects.env.type='element';
                $scope.project=$scope.storage.projects[index];
            }
          , remove:function(index){
                $scope.projects.env.view='remove';
                $scope.projects.env.type='element';
                $scope.project=$scope.storage.projects[index];
            }
          , delete:function(){
                utils.clean();
                if($scope.projects.env.type='element'){
                    utils.send('Sending delete request ...');
                    Resources.projects.delete({
                        project:$scope.project.id
                    },function(data){
                        $scope.projects.refresh();
                        $scope.projects.list();
                        utils.receive();
                        utils.show('success', 'Project removed to the list');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }
            }
        }

        $scope.projects.show();
    }]
);

