'use strict';

pleni.controller('ProjectsController',
    ['$scope','$sessionStorage','Projects',
    function($scope,$sessionStorage,Projects){
        $scope.storage=$sessionStorage;

        $('header>nav>ul:nth-child(2)>li').removeClass('active')
        $('header>nav>ul:nth-child(1)>li:nth-child(3)').addClass('active')
            .siblings().removeClass('active');

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
                Projects.query(function(data){
                    $scope.storage.projects=new Array();
                    for(var i=0;i<data.length;i++){
                        $scope.storage.projects.push({
                            id:data[i].id
                          , _repositories:data[i]._repositories
                        });
                    }
                });
            }
          , implode:function(glue,pieces){
                return pieces.join(glue);
            }
          , save:function(){
                var project=new Projects($scope.project);

                utils.clean();
                if($scope.projects.env.type=='collection'){
                    utils.send('Saving project settings ...');
                    project.$save(function(data){
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
                    project.$update({project:$scope.project.id},
                    function(data){
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
          , view:function(index){
                $scope.projects.env.view='view';
                $scope.projects.env.type='element';
                $scope.project=$scope.storage.projects[index];
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
                    Projects.delete({project:$scope.project.id},
                    function(data){
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

