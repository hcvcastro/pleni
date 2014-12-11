'use strict';

pleni.controller('ResourcesController',
    ['$scope','$sessionStorage','DBServers','Repositories','Planners',
    function($scope,$sessionStorage,DBServers,Repositories,Planners){
        $scope.storage=$sessionStorage;
        $('header nav ul li:nth-child(2)').addClass('active')
            .siblings().removeClass('active');

        $scope.dbserver={
            id:''
          , db:{
                host:''
              , port:''
              , user:''
              , pass:''
              , prefix:''
            }
        };
        $scope.dbservers={
            env:{
                view:'list'
              , type:'collection'
            }
          , show:function(){
                $scope.dbservers.env.view='list';
                $scope.repositories.env.view='list';
                $scope.planners.env.view='list';

                $('section.dbservers').addClass('active')
                    .siblings().removeClass('active');
                $('nav.menu>ul>li:nth-child(1)').addClass('active')
                    .siblings().removeClass('active');
                if(!$scope.storage.dbservers){
                    $scope.dbservers.refresh();
                }
            }
          , refresh:function(){
                $('article.list table').fadeOut();
                DBServers.query(function(data){
                    $scope.storage.dbservers=new Array();
                    for(var i=0;i<data.length;i++){
                        $scope.storage.dbservers.push({
                            id:data[i].id
                          , db:{
                                host:data[i].db.host
                              , port:data[i].db.port
                              , user:data[i].db.user
                              , prefix:data[i].db.prefix
                            }
                          , check:'unknown'
                        });
                    }
                    $('article.list table').fadeIn();
                });
            }
          , save:function(){
                var dbserver=new DBServers($scope.dbserver);

                utils.clean();
                if($scope.dbservers.env.type=='collection'){
                    utils.send('Saving DB server settings ...');
                    dbserver.$save(function(data){
                        $scope.dbservers.refresh();
                        $scope.dbservers.list();
                        utils.receive();
                        utils.show('success','DB server added to the list');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }else if($scope.dbservers.env.type=='element'){
                    utils.send('Updating DB server settings ...');
                    dbserver.$update({dbserver:$scope.dbserver.id},
                    function(data){
                        $scope.dbservers.refresh();
                        $scope.dbservers.list();
                        utils.receive();
                        utils.show('success','DB server updated');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }
            }
          , check:function(index){
                if(index){
                    $scope.dbservers.list();
                }
                if($scope.dbservers.env.view=='form'){
                    if(!$scope.dbserver.id){
                        $scope.dbserver.id='test';
                    }
                    if(!$scope.dbserver.db.prefix){
                        $scope.dbserver.db.prefix='pleni_';
                    }
                    var dbserver=new DBServers($scope.dbserver);

                    utils.clean();
                    utils.send('Checking connection ...');
                    dbserver.$check({},function(data){
                        utils.receive();
                        utils.show('info','DB Server in online');
                    },function(error){
                        utils.receive();
                        utils.show('error','DB Server cannot be founded');
                    });
                }else{
                    var dbserver=$scope.storage.dbservers[index];
                    dbserver.check='checking';
                    DBServers.check({dbserver:dbserver.id},function(data){
                        dbserver.check='online';
                    },function(error){
                        dbserver.check='offline';
                    });
                }
            }
          , list:function(){
                $scope.dbservers.env.view='list';
            }
          , add:function(){
                $scope.dbservers.env.view='form';
                $scope.dbservers.env.type='collection';
            }
          , view:function(index){
                $scope.dbservers.env.view='view';
                $scope.dbservers.env.type='element';
                $scope.dbserver=$scope.storage.dbservers[index];
            }
          , scan:function(){
                utils.clean();
                if($scope.dbservers.env.type=='element'){
                    utils.send('Scanning repositories ...');
                    DBServers.scan({dbserver:$scope.dbserver.id},
                    function(data){
                        $scope.dbserver.check='online';
                        $scope.dbserver.repositories=data;
                        utils.receive();
                        if(data.length==0){
                            utils.show('warning','Repositories not found');
                        }
                    },function(error){
                        $scope.dbserver.check='offline';
                        utils.receive();
                    });
                }
            }
          , add_repo:function(index){
                utils.clean();
                if($scope.dbservers.env.type=='element'){
                    utils.send('Sending add repository request');

                    var _repository=$scope.dbserver.repositories[index]
                      , repository=new Repositories({
                            id:_repository.name
                          , _dbserver:$scope.dbserver.id
                          , db:{
                                name:_repository.params.db_name
                            }
                        });
                    repository.$save(function(data){
                        utils.receive();
                        utils.show('success','Repository added to the list');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }
            }
          , edit:function(index){
                $scope.dbservers.env.view='form';
                $scope.dbservers.env.type='element';
                $scope.dbserver=$scope.storage.dbservers[index];
            }
          , remove:function(index){
                $scope.dbservers.env.view='remove';
                $scope.dbservers.env.type='element';
                $scope.dbserver=$scope.storage.dbservers[index];
            }
          , delete:function(){
                utils.clean();
                if($scope.dbservers.env.type='element'){
                    utils.send('Sending delete request ...');
                    DBServers.delete({dbserver:$scope.dbserver.id},
                    function(data){
                        $scope.dbservers.refresh();
                        $scope.dbservers.list();
                        utils.receive();
                        utils.show('success', 'DB server removed to the list');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }
            }
        };

        $scope.repository={
            id:''
          , _dbserver:''
          , db:{
                name:''
            }
        };
        $scope.repositories={
            env:{
                view:'list'
              , type:'collection'
            }
          , show:function(){
                $scope.dbservers.env.view='list';
                $scope.repositories.env.view='list';
                $scope.planners.env.view='list';

                $('section.repositories').addClass('active')
                    .siblings().removeClass('active');
                $('nav.menu>ul>li:nth-child(2)').addClass('active')
                    .siblings().removeClass('active');
                if(!$scope.storage.repositories){
                    $scope.repositories.refresh();
                }
            }
          , refresh:function(){
                $('article.list table').fadeOut();
                Repositories.query(function(data){
                    $scope.storage.repositories=new Array();
                    for(var i=0;i<data.length;i++){
                        $scope.storage.repositories.push({
                            id:data[i].id
                          , _dbserver:data[i]._dbserver
                          , db:{
                                name:data[i].db.name
                            }
                          , check:'unknown'
                          , type:'site'
                        });
                    }
                    $('article.list table').fadeIn();
                });
            }
          , save:function(){
                var repository=new Repositories($scope.repository);

                utils.clean();
                if($scope.repositories.env.type=='collection'){
                    utils.send('Saving Repository settings ...');
                    repository.$save(function(data){
                        $scope.repositories.refresh();
                        $scope.repositories.list();
                        utils.receive();
                        utils.show('success','Repository added to the list');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }else if($scope.repositories.env.type=='element'){
                    utils.send('Updating Repository settings ...');
                    repository.$update({repository:$scope.repository.id},
                    function(data){
                        $scope.repositories.refresh();
                        $scope.repositories.list();
                        utils.receive();
                        utils.show('success','Repository updated');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }
            }
          , check:function(index){
                if(index){
                    $scope.repositories.list();
                }
                if($scope.repositories.env.view=='form'){
                    if(!$scope.repository.id){
                        $scope.repository.id='test';
                    }
                    var repository=new Repositories($scope.repository);

                    utils.clean();
                    utils.send('Checking connection ...');
                    repository.$check({},function(data){
                        utils.receive();
                        utils.show('info','Repository is online');
                    },function(error){
                        utils.receive();
                        utils.show('error','Repository cannot be founded');
                    });
                }else{
                    var repository=$scope.storage.repositories[index];
                    repository.check='checking';
                    Repositories.check({repository:repository.id},
                    function(data){
                        repository.check='online';
                    },function(error){
                        repository.check='offline';
                        utils.show('error','Repository cannot be founded');
                    });
                }
            }
          , list:function(){
                $scope.repositories.env.view='list';
            }
          , add:function(){
                $scope.repositories.env.view='form';
                $scope.repositories.env.type='collection';
            }
          , view:function(index){
                $scope.repositories.env.view='view';
                $scope.repositories.env.type='element';
                $scope.repository=$scope.storage.repositories[index];
            }
          , edit:function(index){
                $scope.repositories.env.view='form';
                $scope.repositories.env.type='element';
                $scope.repository=$scope.storage.repositories[index];
            }
          , remove:function(index){
                $scope.repositories.env.view='remove';
                $scope.repositories.env.type='element';
                $scope.repository=$scope.storage.repositories[index];
            }
          , delete:function(){
                utils.clean();
                if($scope.repositories.env.type='element'){
                    utils.send('Sending delete request ...');
                    Repositories.delete({repository:$scope.repository.id},
                    function(data){
                        $scope.repositories.refresh();
                        $scope.repositories.list();
                        utils.receive();
                        utils.show('success','Repository removed to the list');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }
            }
        };

        $scope.planner={
            id:''
          , planner:{
                host:''
              , port:''
            }
        };
        $scope.planners={
            env:{
                view:'list'
              , type:'collection'
            }
          , show:function(){
                $scope.dbservers.env.view='list';
                $scope.repositories.env.view='list';
                $scope.planners.env.view='list';

                $('section.planners').addClass('active')
                    .siblings().removeClass('active');
                $('nav.menu>ul>li:nth-child(3)').addClass('active')
                    .siblings().removeClass('active');
                if(!$scope.storage.planners){
                    $scope.planners.refresh();
                }
            }
          , refresh:function(){
                $('article.list table').fadeOut();
                Planners.query(function(data){
                    $scope.storage.planners=new Array();
                    for(var i=0;i<data.length;i++){
                        $scope.storage.planners.push({
                            id:data[i].id
                          , planner:{
                                host:data[i].planner.host
                              , port:data[i].planner.port
                            }
                          , type:'?'
                          , check:'unknown'
                          , status:'unknown'
                          , set:{
                                status:'unknown'
                              , name:''
                              , count:undefined
                              , interval:undefined
                              , tid:0
                              , schema:{}
                            }
                        });
                    }
                    $('article.list table').fadeIn();
                });
            }
          , save:function(){
                var planner=new Planners($scope.planner);

                utils.clean();
                if($scope.planners.env.type=='collection'){
                    utils.send('Saving planner settings ...');
                    planner.$save(function(data){
                        $scope.planners.refresh();
                        $scope.planners.list();
                        utils.receive();
                        utils.show('success','Planner added to the list');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }else if($scope.planners.env.type=='element'){
                    utils.send('Updating planner settings ...');
                    planner.$update({planner:$scope.planner.id},
                    function(data){
                        $scope.planners.refresh();
                        $scope.planners.list();
                        utils.receive();
                        utils.show('success','Planner updated');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }
            }
          , check:function(index){
                if(index){
                    $scope.planners.list();
                }
                if($scope.planners.env.view=='form'){
                    if(!$scope.planner.id){
                        $scope.planner.id='test';
                    }
                    var planner=new Planners($scope.planner);

                    utils.clean();
                    utils.send('Checking connection ...');
                    planner.$check({},function(data){
                        utils.receive();
                        utils.show('info','Planner in online');
                    },function(error){
                        utils.receive();
                        utils.show('error','Planner cannot be founded');
                    });
                }else{
                    var planner=$scope.storage.planners[index];
                    planner.check='checking';
                    Planners.check({server:planner.id},function(data){
                        planner.check='online';
                        planner.type=data.planner.type;
                        
                        Planners.status({server:planner.id},function(data){
                            planner.status=data.planner.status;
                        },function(error){
                            planner.status='unknown';
                        });

                        Planners.isset({server:planner.id},function(data){
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
                }
            }
          , list:function(){
                $scope.planners.env.view='list';
            }
          , add:function(){
                $scope.planners.env.view='form';
                $scope.planners.env.type='collection';
            }
          , view:function(index){
                $scope.planners.env.view='view';
                $scope.planners.env.type='element';
                $scope.planner=$scope.storage.planners[index];
                if(!$scope.planner.api){
                    $scope.planners.api();
                }
                if($scope.planner.set.status=='set'){
                    $scope.planners.editor();
                }
            }
          , api:function(){
                utils.clean();
                if($scope.planners.env.type=='element'){
                    utils.send('Getting available tasks ...');
                    Planners.api({server:$scope.planner.id},
                    function(data){
                        $scope.planner.check='online';
                        $scope.planner.api=data.planner.tasks;
                        utils.receive();
                        if(data.length==0){
                            utils.show('warning','Planner has no Tasks!!');
                        }
                    },function(error){
                        $scope.planner.check='offline';
                        $scope.planner.status='unknown';
                        $scope.planner.set.status='unknown';
                        utils.receive();
                    });
                }
            }
          , set:function(){
                utils.clean();
                if($scope.planners.env.type=='element'){
                    utils.send('Send a set request ...');
                    Planners.set({
                        server:$scope.planner.id
                      , task:{
                            name:$scope.planner.set.name
                          , count:$scope.planner.set.count
                          , interval:$scope.planner.set.interval
                        }
                    },function(data){
                        utils.receive();
                        $scope.planners.get();
                    },function(error){
                        utils.receive();
                    });
                }
            }
          , tid:function(){
                utils.clean();
                if($scope.planners.env.type=='element'){
                    utils.send('Send a tid request ...');
                    Planners.tid({
                        server:$scope.planner.id
                      , tid:$scope.planner.set.tid
                    },function(data){
                        utils.receive();
                        $scope.planner.set.tid=0;
                        $scope.planners.get();
                    },function(error){
                        utils.receive();
                    });
                }
            }
          , get:function(){
                if($scope.planners.env.type=='element'){
                    Planners.get({
                        server:$scope.planner.id
                    },function(data){
                        $scope.planner.set.status='set';
                        $scope.planner.set.name=data.planner.task.name;
                        $scope.planner.set.count=data.planner.task.count;
                        $scope.planner.set.interval=data.planner.task.interval;
                        for(var i=0;i<$scope.planner.api.length;i++){
                            if($scope.planner.set.name==
                                $scope.planner.api[i].name){
                                $scope.planner.set.schema=
                                    $scope.planner.api[i].schema;
                                break;
                            }
                        }
                        $scope.planners.editor();
                    },function(error){
                        utils.show('error','Planner cannot get the task');
                    });
                }
            }
          , editor:function(){
                if($scope.jsoneditor){
                    $scope.jsoneditor.destroy();
                }

                var schema=$scope.planner.set.schema;
                if(schema.properties._dbserver){
                    schema.properties._dbserver.enum=
                        $scope.storage.dbservers.map(function(dbserver){
                            return dbserver.id;
                        });
                }
                if(schema.properties._repository){
                    schema.properties._repository.enum=
                        $scope.storage.repositories.map(function(repository){
                            return repository.id;
                        });
                }

                $scope.jsoneditor=jsoneditor(
                    $scope.planner.set.name+' ('
                        +$scope.planner.set.count+':'
                        +$scope.planner.set.interval+')'
                  , schema
                );
            }
          , unset:function(){
                utils.clean();
                if($scope.planners.env.type=='element'){
                    utils.send('Sending a remove request ...');
                    Planners.unset({server:$scope.planner.id},
                    function(data){
                        utils.receive();
                        $scope.planner.set.status='unset';
                        $scope.planner.set.name='';
                        $scope.planner.set.count=undefined;
                        $scope.planner.set.interval=undefined;
                        $scope.planner.set.schema={};
                    },function(error){
                        utils.receive();
                        utils.show('error',error);
                    });
                }
            }
          , run:function(){
                utils.clean();
                if($scope.planners.env.type=='element'){
                    utils.send('Sending a run request ...');
                    var error=$scope.jsoneditor.validate();
                    if(error.length==0){
                        Planners.run({
                            server:$scope.planner.id
                          , targs:$scope.jsoneditor.getValue()
                        },function(data){
                            utils.receive();
                            $scope.planner.status='running';
                        },function(error){
                            utils.receive();
                            utils.show('error',error.data.message);
                        });
                    }else{
                        utils.receive();
                        utils.show('error','Some parameters are invalids');
                    }
                }
            }
          , stop:function(){
                utils.clean();
                if($scope.planners.env.type=='element'){
                    utils.send('Sending a stop request ...');
                    Planners.stop({server:$scope.planner.id},function(data){
                        utils.receive();
                        $scope.planner.status='stopped';
                    },function(error){
                        utils.receive();
                        utils.show('error',error);
                    });
                }
            }
          , edit:function(index){
                $scope.planners.env.view='form';
                $scope.planners.env.type='element';
                $scope.planner=$scope.storage.planners[index];
            }
          , remove:function(index){
                $scope.planners.env.view='remove';
                $scope.planners.env.type='element';
                $scope.planner=$scope.storage.planners[index];
            }
          , delete:function(){
                utils.clean();
                if($scope.planners.env.type='element'){
                    utils.send('Sending delete request ...');
                    Planners.delete({planner:$scope.planner.id},
                    function(data){
                        $scope.planners.refresh();
                        $scope.planners.list();
                        utils.receive();
                        utils.show('success', 'Planner removed to the list');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }
            }
        };

        $scope.notifiers={
            show:function(){
                $('section.notifiers').addClass('active')
                    .siblings().removeClass('active');
                $('nav.menu>ul>li:nth-child(4)').addClass('active')
                    .siblings().removeClass('active');
            }
        };

        $scope.dbservers.show();
    }]
);

