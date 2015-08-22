'use strict';

pleni.controller('WorkspaceController',
    ['$scope','$routeParams','$location','$sessionStorage',
    'Resources','Editor','Visual',
    function($scope,$routeParams,$location,$sessionStorage,
        Resources,Editor,Visual){
        $scope.Math = window.Math;

        utils.set_tab(0,3);
        utils.set_header(false);

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
          , repository:''
          , viewer:'overview'
          , index:-1
        };

        $scope.ui={
            planner:[]
          , task:{}
        }

        $scope.viewers={
            collection:[]
          , document:null
          , classcodes:function(code){
                return 'status'+(Math.floor(+code/100))+'xx';
            }
          , filters:[
                ['ALL','ALL','ALL']
              , ['ALL']
              , ['ALL','ALL']
            ]
          , mimetypes:{}
          , limit:25
          , offset:0
          , total:0
        }

        $scope.workspace={
            env:{
                panel:''
              , task:''
            }
          , init:function(){
                $scope.workspace.env.panel='';

                Resources.repositories.load();
                Resources.projects.get({
                    project:$scope.storage.workspace.name
                },function(data){
                    $scope.storage.workspace.repositories=
                        data._repositories.map(function(repository){
                        return {
                            name:repository
                          , loading:false
                          , type:''
                        };
                    });

                    $scope.planners.load();
                    $scope.repositories.load();
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
                return 'pleni-'+name.replace('/','-');
            }
          , icon_r:function(name){
                return 'pleni-'+name;
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
          , follow:function(index,planner){
                for(var i in $scope.storage.planners){
                    if(planner.id==$scope.storage.planners[i].id){
                        $scope.planners.follow(i);
                    }
                }
            }
          , check:function(index,planner){
                for(var i in $scope.storage.planners){
                    if(planner.id==$scope.storage.planners[i].id){
                        $scope.planners.check(i);
                    }
                }
            }
          , run:function(index,planner){
                if(!planner.set.count||!planner.set.interval){
                    utils.show('error',
                    'The count and interval parameters are required');
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
                  , repositories=project.repositories
                  , dbserver=$scope.storage.dbservers[index1]
                  , repository=dbserver.repositories[index2]

                function add_workspace(){
                    repositories.push({name:repository.name});
                    Resources.projects.update({
                        project:project.name
                      , id:project.name
                      , _repositories:project.repositories.map(
                        function(r){return r.name;})
                    },function(data){
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
          , remove:function(){
                var project=$scope.storage.workspace
                  , repositories=project.repositories
                  , repository=project.repository
                  , index=-1
                
                for(var i in repositories){
                    if(repositories[i].name==repository){
                        index=i;
                    }
                }

                if(index>=0){
                    repositories.splice(index,1);
                }

                Resources.projects.update({
                    project:project.name
                  , id:project.name
                  , _repositories:repositories.map(
                        function(r){return r.name;})
                },function(data){
                    $scope.repositories.overview();
                },function(error){});
            }
          , overview:function(){
                $scope.storage.workspace.repository='';
                $scope.storage.workspace.viewer='overview';
            }
          , summary:function(index){
                var workspace=$scope.storage.workspace

                if(workspace.repositories[index]){
                    workspace.viewer='summary';
                    workspace.repository=workspace.repositories[index].name;
                    workspace.repositories[index].loading=true;
                    workspace.index=index;

                    $scope.viewers.collection=[];
                    $scope.viewers.document=null;

                    Resources.workspace.summary(workspace.name,
                        workspace.repository,function(data){
                        workspace.repositories[index].loading=false;
                        workspace.repositories[index].type=data.type;
                        $scope.viewers.document=data;
                    },function(error){
                        workspace.repositories[index].loading=false;
                    });
                }else{
                    utils.show('error','The repository is not valid');
                }
            }
          , summarize:function(){
                Resources.workspace.summarize(
                    $scope.storage.workspace.name,
                    $scope.storage.workspace.repository,function(data){
                    $scope.repositories.summary($scope.storage.workspace.index);
                },function(error){
                    utils.show('error','The summarize fail');
                });
            }
          , pagination_first:function(){
                var offset=$scope.viewers.offset
                  , viewer=$scope.storage.workspace.viewer

                if(offset!=0){
                    $scope.viewers.offset=0;
                    $scope.repositories[viewer]();
                }
            }
          , pagination_previous:function(){
                var offset=$scope.viewers.offset
                  , limit=$scope.viewers.limit
                  , viewer=$scope.storage.workspace.viewer

                if(offset!=0){
                    $scope.viewers.offset-=limit;
                    $scope.repositories[viewer]();
                }
            }
          , pagination_next:function(){
                var offset=$scope.viewers.offset
                  , limit=$scope.viewers.limit
                  , total=$scope.viewers.total
                  , viewer=$scope.storage.workspace.viewer

                if(offset+limit<total){
                    $scope.viewers.offset=offset+limit;
                    $scope.repositories[viewer]();
                }
            }
          , pagination_last:function(){
                var offset=$scope.viewers.offset
                  , limit=$scope.viewers.limit
                  , total=$scope.viewers.total
                  , viewer=$scope.storage.workspace.viewer

                if(offset+limit<total){
                    $scope.viewers.offset=total-(total%limit);
                    $scope.repositories[viewer]();
                }
            }
          , requests:function(filter){
                var workspace=$scope.storage.workspace
                  , viewers=$scope.viewers
                  , index=workspace.index

                viewers.collection=[];
                viewers.document=null;
                workspace.viewer='requests';
                workspace.repositories[index].loading=true;

                if(filter){
                    viewers.offset=0;
                }

                Resources.workspace.requests(workspace.name,
                    workspace.repository,viewers.filters[0].join('|'),
                    viewers.limit,viewers.offset,function(data){
                    workspace.repositories[index].loading=false;
                    viewers.total=+data.total;
                    viewers.collection=data.list.map(function(r){
                        return {
                            id:r.id
                          , status:r.status
                          , ts_created:utils.prettydate(r.ts_created)
                          , ts_modified:utils.prettydate(r.ts_modified)
                          , request:{
                                method:r.request.method
                              , url:r.request.url
                            }
                          , response:{
                                status:r.response?r.response.status:'--'
                            }
                        };
                    });
                },function(error){
                    workspace.repositories[index].loading=false;
                });
            }
          , request:function(id){
                var workspace=$scope.storage.workspace

                Resources.workspace.document(workspace.name,
                    workspace.repository,id,function(data){
                    $scope.viewers.document=data;
                },function(error){
                    utils.show('error','The document is not found');
                });
            }
          , pages:function(filter){
                var workspace=$scope.storage.workspace
                  , viewers=$scope.viewers
                  , index=workspace.index

                viewers.collection=[];
                viewers.document=null;
                workspace.viewer='pages';
                workspace.repositories[index].loading=true;

                if(filter){
                    viewers.offset=0;
                }

                Resources.workspace.pages(workspace.name,
                    workspace.repository,viewers.filters[1].join('|'),
                    viewers.limit,viewers.offset,function(data){
                    workspace.repositories[index].loading=false;
                    viewers.total=+data.total;
                    viewers.collection=data.list.map(function(r){
                        return {
                            id:r.id
                          , status:r.status
                          , statuscode:r.statuscode
                          , ts_created:utils.prettydate(r.ts_created)
                          , ts_modified:utils.prettydate(r.ts_modified)
                          , page:r.id.split('::')[1]
                        };
                    });
                },function(error){
                    workspace.repositories[index].loading=false;
                });
            }
          , page:function(id){
                console.log('view page');
            }
          , files:function(filter){
                var workspace=$scope.storage.workspace
                  , viewers=$scope.viewers
                  , index=workspace.index

                viewers.collection=[];
                viewers.document=null;
                workspace.viewer='files';
                workspace.repositories[index].loading=true;

                if(filter){
                    viewers.offset=0;
                }

                Resources.workspace.files(workspace.name,
                    workspace.repository,viewers.filters[2].join('|'),
                    viewers.limit,viewers.offset,function(data){
                    workspace.repositories[index].loading=false;
                    viewers.total=+data.total;
                    viewers.collection=data.list.map(function(r){
                        return {
                            id:r.id
                          , status:r.status
                          , statuscode:r.statuscode
                          , ts_created:utils.prettydate(r.ts_created)
                          , ts_modified:utils.prettydate(r.ts_modified)
                          , file:r.id.split('::')[1]
                          , mimetype:r.mimetype
                          , filesize:utils.prettyfilesize(r.filesize,true)
                        };
                    });

                    Resources.workspace.mimetypes(workspace.name,
                        workspace.repository,function(data){
                        viewers.mimetypes=data;
                    },function(error){});

                },function(error){
                    workspace.repositories[index].loading=false;
                });
            }
          , file:function(id){
                console.log('view file');
            }
          , sitemap:function(){
                var workspace=$scope.storage.workspace
                  , viewers=$scope.viewers
                  , index=workspace.index

                viewers.collection=[];
                viewers.document=null;
                workspace.viewer='sitemap';
                workspace.repositories[index].loading=true;

                Resources.workspace.sitemap(workspace.name,workspace.repository,
                    function(data){
                    $scope.storage.workspace.repositories[index].loading=false;
                    Visual.clean();
                    Visual.render(data);
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

