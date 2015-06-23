'use strict';

pleni.controller('HomeController',
    ['$scope','$sessionStorage','Auth','Resources',
    function($scope,$sessionStorage,Auth,Resources){
    utils.set_tab(0,1);
    utils.set_header(true);

    if(!Auth.isUser('monitr')){
        utils.set_active('signin',1);

        $('input[name=email]').focus();

        $scope.email='';
        $scope.password='';

        $scope.signin=function(){
            utils.send('Trying login into account ...');
            Auth.signin($scope.email,$scope.password,
                $('input[name=_csrf]').val(),
                function(){
                    location.reload();
                });
        };
    }else{
        $scope.storage=$sessionStorage;

        $scope.app={
            id:''
          , key:''
        };
        $scope.apps={
            env:{
                view:'list'
              , type:'collection'
            }
          , show:function(){
                utils.set_list($scope);
                utils.set_active('apps',1);
                if(!$scope.storage.apps){
                    $scope.apps.refresh();
                }
            }
          , refresh:function(hide){
                utils.load_resources_start(1,hide)
                Resources.apps.load(utils.load_resources_end(1,hide));
            }
          , save:function(){
                utils.clean();
                if($scope.apps.env.type=='collection'){
                    utils.send('Saving app settings ...');
                    Resources.apps.create($scope.app,function(data){
                        $scope.apps.refresh();
                        $scope.apps.list();
                        utils.receive();
                        utils.show('success','App added to the list');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }
            }
          , list:function(){
                $scope.apps.env.view='list';
            }
          , add:function(){
                $scope.apps.env.view='form';
                $scope.apps.env.type='collection';
            }
          , view:function(index){
                $scope.apps.env.view='view';
                $scope.apps.env.type='element';
                $scope.app=$scope.storage.apps[index];
            }
          , remove:function(index){
                $scope.apps.env.view='remove';
                $scope.apps.env.type='element';
                $scope.app=$scope.storage.apps[index];
            }
          , delete:function(){
                utils.clean();
                if($scope.apps.env.type='element'){
                    utils.send('Sending delete request ...');
                    Resources.apps.delete({
                        app:$scope.app.id
                    },function(data){
                        $scope.apps.refresh();
                        $scope.apps.list();
                        utils.receive();
                        utils.show('success', 'App removed to the list');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }
            }
        };

        $scope.dbserver={
            id:''
          , type:'real'
          , db:{
                host:''
              , port:0
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
                utils.set_list($scope);
                utils.set_active('dbservers',2);
                if(!$scope.storage.dbservers){
                    $scope.dbservers.refresh();
                }
            }
          , refresh:function(hide){
                utils.load_resources_start(2,hide)
                Resources.dbservers.load(utils.load_resources_end(2,hide));
            }
          , save:function(){
                utils.clean();
                if($scope.dbservers.env.type=='collection'){
                    utils.send('Saving DB server settings ...');
                    Resources.dbservers.create($scope.dbserver,function(data){
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
                    Resources.dbservers.update({
                        dbserver:$scope.dbserver.id
                      , id:$scope.dbserver.id
                      , type:'real'
                      , db:$scope.dbserver.db
                    },function(data){
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

                    utils.clean();
                    utils.send('Checking connection ...');
                    Resources.dbservers.check({
                        id:$scope.dbserver.id
                      , type:'real'
                      , db:$scope.dbserver.db
                    },function(data){
                        utils.receive();
                        utils.show('info','DB Server is online');
                    },function(error){
                        utils.receive();
                        utils.show('error','DB Server cannot be found');
                    });
                }else{
                    var dbserver=$scope.storage.dbservers[index];
                    dbserver.check='checking';
                    Resources.dbservers.check({
                        dbserver:dbserver.id
                    },function(data){
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
                    Resources.dbservers.scan({
                        dbserver:$scope.dbserver.id
                    },function(data){
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
          , repositories:{
                add:function(index){
                    utils.clean();
                    if($scope.dbservers.env.type=='element'){
                        utils.send('Sending add repository request');
                        var _repository=$scope.dbserver.repositories[index];
                        Resources.repositories.create({
                            id:_repository.name
                          , _dbserver:$scope.dbserver.id
                          , db:{
                                name:_repository.params.db_name
                            }
                        },function(data){
                            utils.receive();
                            utils.show('success',
                                'Repository added to the list');
                        },function(error){
                            utils.receive();
                            utils.show('error',error.data.message);
                        });
                    }
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
                    Resources.dbservers.delete({
                        dbserver:$scope.dbserver.id
                    },function(data){
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

        $scope.planner={
            id:''
          , planner:{
                host:''
              , port:0
            }
        };
        $scope.planners={
            env:{
                view:'list'
              , type:'collection'
            }
          , show:function(){
                utils.set_list($scope);
                utils.set_active('planners',3);
                if(!$scope.storage.planners){
                    $scope.planners.refresh();
                }
            }
          , refresh:function(hide){
                utils.load_resources_start(3,hide)
                Resources.planners.load(utils.load_resources_end(3,hide));
            }
          , save:function(){
                utils.clean();
                if($scope.planners.env.type=='collection'){
                    utils.send('Saving planner settings ...');
                    Resources.planners.create($scope.planner,function(data){
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
                    Resources.planners.update({
                        server:$scope.planner.id
                      , id:$scope.planner.id
                      , planner:$scope.planner.planner
                    },function(data){
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
                if($scope.planners.env.view=='form'){
                    if(!$scope.planner.id){
                        $scope.planner.id='test';
                    }

                    utils.clean();
                    utils.send('Checking connection ...');
                    Resources.planners.check($scope.planner,function(data){
                        utils.receive();
                        utils.show('info','Planner is online');
                    },function(error){
                        utils.receive();
                        utils.show('error','Planner cannot be found');
                    });
                }else{
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
                                $scope.planners.get();
                            }else{
                                planner.set.status='unset';
                            }
                        },function(error){
                            planner.set.status='unknown';
                        });
                    },function(error){
                        planner.check='offline';
                        utils.show('error','Planner cannot be found');
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
                $scope.planners.check(index);
            }
          , api:function(next){
                $('.api').addClass('fa-spin');
                utils.clean();
                if($scope.planners.env.type=='element'){
                    utils.send('Getting available tasks ...');
                    Resources.planners.api({
                        server:$scope.planner.id
                    },function(data){
                        $scope.planner.check='online';
                        $scope.planner.api=data.planner.tasks;
                        utils.receive();
                        $('.api').removeClass('fa-spin');
                        if(data.length==0){
                            utils.show('warning','Planner has no Tasks!!');
                        }
                        if(next){
                            next();
                        }
                    },function(error){
                        $scope.planner.check='offline';
                        $scope.planner.status='unknown';
                        $scope.planner.set.status='unknown';
                        utils.receive();
                    });
                }
            }
          , clean:function(index){
                var planner=$scope.storage.planners[index];

                utils.send('Send a clean TID request ...');
                Resources.planners.clean({
                    server:planner.id
                },function(data){
                    utils.receive();
                    utils.show('success','Cleaned the TID planner');
                },function(error){
                    utils.receive();
                    utils.show('error',error);
                });
            }
          , exclusive:function(index){
                var planner=$scope.storage.planners[index];

                utils.send('Send a set request ...');
                Resources.planners.exclusive({
                    server:planner.id
                },function(data){
                    utils.receive();
                    utils.show('success','Planner taken');
                },function(error){
                    utils.receive();
                    utils.show('error',error);
                });
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
                    Resources.planners.delete({
                        planner:$scope.planner.id
                    },function(data){
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

        $scope.apps.refresh();
        $scope.dbservers.refresh();
        $scope.planners.refresh();

        $scope.apps.show();
    }
}]);

