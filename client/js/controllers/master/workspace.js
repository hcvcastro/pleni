'use strict';

pleni.controller('WorkspaceController',
    ['$scope','$routeParams','$location','$sessionStorage',
    'Resources','Editor','Visual',
    function($scope,$routeParams,$location,$sessionStorage,
        Resources,Editor,Visual){
        $scope.storage=$sessionStorage;

        if(!$routeParams.project){
            $location.path('/projects');
        }

        $scope.storage.workspace={
            name:$routeParams.project
          , repositories:new Array()
          , available:{}
          , enabled:{}
          , apis:{}
          , visual:''
        };

        $scope.ui={
            planner:[]
          , task:{}
        }

        $scope.workspace={
            env:{
                panel:''
              , task:''
            }
          , init:function(){
                $scope.workspace.env.panel='';

                Resources.projects.get({
                    project:$scope.storage.workspace.name
                },function(data){
                    $scope.storage.workspace.repositories=
                        data._repositories.map(function(repository){
                        return {
                            name:repository
                          , loading:false
                        };
                    });

                    $scope.planners.load();
                    $scope.repositories.load();
                    $scope.visual.load();
                },function(error){});
            }
          , exit:function(){
                delete $scope.storage.workspace;
                $location.path('/projects');
            }
          , settings:function(){
                if($scope.workspace.env.panel=='settings'){
                    $scope.workspace.close();
                }else{
                    $scope.workspace.env.panel='settings';
                }
            }
          , repositories:function(){
                if($scope.workspace.env.panel=='repositories'){
                    $scope.workspace.close();
                }else{
                    $scope.workspace.env.panel='repositories';
                }
            }
          , close:function(){
                Resources.projects.load();
                $scope.workspace.env.panel='';
            }
          , icon_p:function(name){
                return 'fa-pleni-'+name.replace('/','-');
            }
          , icon_r:function(name){
                return 'fa-pleni-repo-'+name;
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
                    $scope.planners.api(index);
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
          , api:function(index){
                var planner=$scope.storage.planners[index];
                Resources.planners.api({
                    server:planner.id
                },function(data){
                    planner.api=data.planner.tasks;
                    planner.api.forEach(function(task){
                        $scope.storage.workspace
                            .apis[task.name]=task.schema;
                        if($scope.storage.workspace.available[task.name]){
                            if(!$scope.storage.workspace
                                    .available[task.name].some(
                                        function(element){
                                return element.id==planner.id;
                            })){
                                $scope.storage.workspace
                                      .available[task.name].push(planner);
                            }
                        }else{
                            $scope.storage.workspace
                                  .available[task.name]=[planner];
                            $scope.ui.task[task.name]=false;
                        }
                    });
                },function(error){});
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
                            if(!$scope.storage.workspace
                                    .enabled[task.name].some(
                                        function(element){
                                return element.id==planner.id;
                            })){
                                $scope.storage.workspace
                                    .enabled[task.name].push(planner);
                            }
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
                        },function(error){});
                        break;
                }
            }
        };

        $scope.task={
            name:''
          , planners:[]
        };

        $scope.tasks={
            open:function(task,planners){
                if($scope.workspace.env.panel=='tasks'&&
                    $scope.workspace.env.task==task){
                    $scope.workspace.close();
                }else{
                    $scope.workspace.env.panel='tasks';
                    $scope.workspace.env.task=task;
                    $scope.task.name=task;
                    $scope.task.planners=planners;
                    Editor.create(task,$scope.storage.workspace.apis[task]);
                }
            }
          , run:function(index,planner){
                if(!planner.set.count||!planner.set.interval){
                    utils.show('error',
                    'The count and interval parameters cannot are required');
                    return;
                }
                if(!Editor.is_valid()){
                    utils.show('error',
                    'Some parameters in form are not valid');
                    return;
                }

                Resources.planners.unset({
                    server:planner.id
                },function(data){
                    Resources.planners.set({
                        server:planner.id
                      , task:{
                            name:$scope.task.name
                          , count:planner.set.count
                          , interval:planner.set.interval
                        }
                    },function(data){
                        Resources.planners.run({
                            server:planner.id
                          , targs:Editor.values()
                        },function(data){
                        },function(error){});
                    },function(error){});
                },function(error){});
            }
          , stop:function(index,planner){
                Resources.planners.stop({
                    server:planner.id
                },function(data){
                },function(error){});
            }
        };

        $scope.repositories={
            load:function(){
                Resources.dbservers.load(function(data){
                    for(var index in $scope.storage.dbservers){
                        $scope.repositories.scan(index);
                    }
                });
            }
          , scan:function(index){
                var dbserver=$scope.storage.dbservers[index];

                dbserver.check='scanning';
                dbserver.toggle='show';
                Resources.dbservers.scan({
                    dbserver:dbserver.id
                },function(data){
                    dbserver.check='online';
                    dbserver.repositories=data;
                },function(error){
                    dbserver.check='offline';
                });
            }
          , toggle:function(index){
                var dbserver=$scope.storage.dbservers[index];

                switch(dbserver.toggle){
                    case 'show':
                        dbserver.toggle='hide';
                        break;
                    case 'hide':
                        dbserver.toggle='show';
                        break;
                }
            }
          , add:function(index1,index2){
                var project=$scope.storage.workspace
                  , repositories=$scope.storage.workspace.repositories
                  , dbserver=$scope.storage.dbservers[index1]
                  , repository=dbserver.repositories[index2]
                  , add_workspace=function(){
                        repositories.push({name:repository.name});
                        Resources.projects.update({
                            project:project.name
                          , id:project.name
                          , _repositories:project.repositories.map(
                            function(r){return r.name;})
                        },function(data){
                            $scope.visual.summary(repositories.length-1);
                        },function(error){});
                    }

                if(repositories.some(function(r){
                        return repository.name==r.name;})){
                    utils.show('error','The repository is already added');
                    return;
                }

                Resources.repositories.create({
                    id:repository.name
                  , _dbserver:dbserver.id
                  , db:{
                        name:repository.params.db_name
                    }
                },function(data){
                    add_workspace();
                    Resources.repositories.load();
                },function(error){
                    switch(error.data.message){
                        case 'Validation error':
                            utils.show('error',
                                'The repository cannot be added');
                            break;
                        case 'Resource cannot overridden':
                            add_workspace();
                            break;
                    }
                });
            }
          , empty:function(){
                $scope.storage.workspace.visual='';
                Visual.clean();
            }
          , open:function(index){
                if($scope.storage.workspace.repositories[index]){
                    $scope.storage.workspace.repositories[index].loading=true;
                    $scope.storage.workspace.visual=
                        $scope.storage.workspace.repositories[index].name;
                    $scope.visual.sitemap(index);
                }else{
                    utils.show('error',
                        'The repository does not have a valid format');
                }
            }
          , summary:function(index){
                console.log('get summary');
            }
          , report:function(index){
                console.log('get report');
            }
        };

        $scope.visual={
            load:function(){
                for(var index in $scope.storage.workspace.repositories){
                    $scope.visual.summary(index);
                }
            }
          , summary:function(index){
                var project=$scope.storage.workspace.name
                  , repository=$scope.storage.workspace.repositories[index].name

                Resources.workspace.summary(project,repository,function(data){
                    $scope.storage.workspace.repositories[index].summary=data;
                },function(error){
                    $scope.storage.workspace.repositories[index]=undefined;
                });
            }
          , sitemap:function(index){
                var project=$scope.storage.workspace.name
                  , repository=$scope.storage.workspace.repositories[index].name

                Resources.workspace.sitemap(project,repository,function(data){
                    Visual.clean();
                    Visual.render(data);
                    $scope.storage.workspace.repositories[index].loading=false;
                },function(error){
                    utils.show('error',
                        'The repository does not have a valid sitemap');
                    $scope.storage.workspace.repositories[index].loading=false;
                });
            }
        };

        $scope.workspace.init();
    }]
);

