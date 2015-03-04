'use strict';

pleni.controller('ResourcesController',
    ['$scope','$sessionStorage','Resources','Editor',
    function($scope,$sessionStorage,Resources,Editor){
        $scope.storage=$sessionStorage;

        $('header>nav>ul:nth-child(2)>li').removeClass('active')
        $('header>nav>ul:nth-child(1)>li:nth-child(2)').addClass('active')
            .siblings().removeClass('active');

        var get_element=function(needle,haystack){
                for(var i in haystack){
                    if(haystack[i].id==needle){
                        return [i,haystack[i]];
                    }
                }
                return;
            };

        $scope.dbserver={
            id:''
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
                utils.set_active('dbservers',1);
                if(!$scope.storage.dbservers){
                    $scope.dbservers.refresh();
                }
            }
          , refresh:function(hide){
                utils.load_resources_start(1,hide)
                Resources.dbservers.load(utils.load_resources_end(1,hide));
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
                    Resources.dbservers.check($scope.dbserver,function(data){
                        utils.receive();
                        utils.show('info','DB Server is online');
                    },function(error){
                        utils.receive();
                        utils.show('error','DB Server cannot be founded');
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
                utils.set_list($scope);
                utils.set_active('repositories',2);
                if(!$scope.storage.repositories){
                    $scope.repositories.refresh();
                }
            }
          , refresh:function(hide){
                utils.load_resources_start(2,hide)
                Resources.repositories.load(utils.load_resources_end(2,hide));
            }
          , save:function(){
                utils.clean();
                if($scope.repositories.env.type=='collection'){
                    utils.send('Saving Repository settings ...');
                    Resources.repositories.create($scope.repository,
                    function(data){
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
                    Resources.repositories.update({
                        repository:$scope.repository.id
                      , id:$scope.repository.id
                      , _dbserver:$scope.repository._dbserver
                      , db:$scope.repository.db
                    },function(data){
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

                    utils.clean();
                    utils.send('Checking connection ...');
                    Resources.repositories.check($scope.repository,
                    function(data){
                        utils.receive();
                        utils.show('info','Repository is online');
                    },function(error){
                        utils.receive();
                        utils.show('error','Repository cannot be founded');
                    });
                }else{
                    var repository=$scope.storage.repositories[index];
                    repository.check='checking';
                    Resources.repositories.check({
                        repository:repository.id
                    },function(data){
                        repository.check='online';
                        utils.show('info','Repository is online');
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
                    Resources.repositories.delete({
                        repository:$scope.repository.id
                    },function(data){
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
                        id:$scope.planner.id
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
                        utils.show('error','Planner cannot be founded');
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
                        utils.show('error','Planner cannot be founded');
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
          , set:function(){
                utils.clean();
                if($scope.planners.env.type=='element'){
                    utils.send('Send a set request ...');
                    Resources.planners.set({
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
                        utils.show('error',error.data.message);
                    });
                }
            }
          , tid:function(){
                utils.clean();
                if($scope.planners.env.type=='element'){
                    utils.send('Send a tid request ...');
                    Resources.planners.tid({
                        server:$scope.planner.id
                      , tid:$scope.planner.set.tid
                    },function(data){
                        utils.receive();
                        $scope.planner.set.tid=0;
                        $scope.planners.get();
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }
            }
          , get:function(){
                if($scope.planners.env.type=='element'){
                    Resources.planners.get({
                        server:$scope.planner.id
                    },function(data){
                        $scope.planner.set.status='set';
                        $scope.planner.set.name=data.planner.task.name;
                        $scope.planner.set.count=data.planner.task.count;
                        $scope.planner.set.interval=data.planner.task.interval;

                        $scope.planners.api(function(){
                            for(var i=0;i<$scope.planner.api.length;i++){
                                if($scope.planner.set.name==
                                    $scope.planner.api[i].name){
                                    $scope.planner.set.schema=
                                        $scope.planner.api[i].schema;
                                    break;
                                }
                            }

                            $scope.planners.editor();
                        });
                    },function(error){
                        utils.show('error','Planner cannot get the task');
                    });
                }
            }
          , editor:function(){
                Editor.create(
                    $scope.planner.set.name+' ('
                        +$scope.planner.set.count+':'
                        +$scope.planner.set.interval+')',
                    $scope.planner.set.schema);
            }
          , unset:function(){
                utils.clean();
                if($scope.planners.env.type=='element'){
                    utils.send('Sending a remove request ...');
                    Resources.planners.unset({
                        server:$scope.planner.id
                    },function(data){
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
                    if(Editor.is_valid()){
                        Resources.planners.run({
                            server:$scope.planner.id
                          , targs:Editor.values()
                        },function(data){
                            utils.receive();
                            $scope.planner.status='running';
                        },function(error){
                            utils.receive();
                            utils.show('error',error.data.message);
                        });
                    }else{
                        utils.receive();
                        utils.show('error',
                            'Some parameters in the form are not valid');
                    }
                }
            }
          , stop:function(){
                utils.clean();
                if($scope.planners.env.type=='element'){
                    utils.send('Sending a stop request ...');
                    Resources.planners.stop({
                        server:$scope.planner.id
                    },function(data){
                        utils.receive();
                        $scope.planner.status='stopped';
                    },function(error){
                        utils.receive();
                        utils.show('error',error);
                    });
                }
            }
          , follow:function(index){
                var planner=$scope.storage.planners[index]
                  , notifier='master'

                if(planner.follow){
                    utils.send('Send a remove request ...');
                    Resources.notifiers.remove({
                        server:notifier
                      , planner:planner.id
                    },function(data){
                        utils.receive();
                        $scope.storage.planners[index].follow=false;
                        utils.show('success','Planner removed to the list');
                    },function(error){
                        utils.receive();
                    });
                }else{
                    utils.send('Send add request ...');
                    Resources.notifiers.add({
                        server:notifier
                      , planner:planner.id
                    },function(data){
                        utils.receive();
                        $scope.storage.planners[index].follow=true;
                        utils.show('success','Planner added to the list');
                    },function(error){
                        utils.receive();
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

        $scope.notifier={
            id:''
          , notifier:{
                host:''
              , port:0
            }
          , planner:''
        };
        $scope.notifiers={
            env:{
                view:'list'
              , type:'collection'
            }
          , show:function(){
                utils.set_list($scope);
                utils.set_active('notifiers',4);
                if(!$scope.storage.notifiers){
                    $scope.notifiers.refresh();
                }
            }
          , refresh:function(hide){
                utils.load_resources_start(4,hide)
                Resources.notifiers.load(utils.load_resources_end(4,hide));
            }
          , save:function(){
                utils.clean();
                if($scope.notifiers.env.type=='collection'){
                    utils.send('Saving notifier settings ...');
                    Resources.notifiers.create($scope.notifier,function(data){
                        $scope.notifiers.refresh();
                        $scope.notifiers.list();
                        utils.receive();
                        utils.show('success','Notifier added to the list');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }else if($scope.notifiers.env.type=='element'){
                    utils.send('Updating notifier settings ...');
                    Resources.notifiers.update({
                        id:$scope.notifier.id
                      , notifier:$scope.notifier.notifier
                    },function(data){
                        $scope.notifiers.refresh();
                        $scope.notifiers.list();
                        utils.receive();
                        utils.show('success','Notifier updated');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }
            }
          , check:function(index){
                if(index){
                    $scope.notifiers.list();
                }
                if($scope.notifiers.env.view=='form'){
                    if(!$scope.notifier.id){
                        $scope.notifier.id='test';
                    }

                    utils.clean();
                    utils.send('Checking connection ...');
                    Resources.notifiers.check($scope.notifier,function(data){
                        utils.receive();
                        utils.show('info','Notifier is online');
                    },function(error){
                        utils.receive();
                        utils.show('error','Notifier cannot be founded');
                    });
                }else{
                    var notifier=$scope.storage.notifiers[index];
                    notifier.check='checking';
                    Resources.notifiers.check({
                        server:notifier.id
                    },function(data){
                        notifier.check='online';
                        notifier.type=data.notifier.type;
                    },function(error){
                        notifier.check='offline';
                        utils.show('error','Notifier cannot be founded');
                    });
                }
            }
          , list:function(){
                $scope.notifiers.env.view='list';
            }
          , add:function(){
                $scope.notifiers.env.view='form';
                $scope.notifiers.env.type='collection';
            }
          , view:function(index){
                $scope.notifiers.env.view='view';
                $scope.notifiers.env.type='element';
                $scope.notifier=$scope.storage.notifiers[index];
                $scope.notifiers.get();
            }
          , get:function(){
                utils.clean();
                if($scope.notifiers.env.type=='element'){
                    Resources.notifiers.get({
                        server:$scope.notifier.id
                    },function(data){
                        $scope.notifier.planners=data.notifier._planners;
                    },function(error){
                        utils.show('error','Notifier cannot get the planners');
                    });
                }
            }
          , planners:{
                add:function(index){
                    utils.clean();
                    if($scope.notifiers.env.type=='element'){
                        utils.send('Send add request ...');
                        Resources.notifiers.add({
                            server:$scope.notifier.id
                          , planner:$scope.storage.planners[index].id
                        },function(data){
                            utils.receive();
                            $scope.notifiers.get();
                            $scope.storage.planners[index].follow=true;
                            utils.show('success','Planner added to the list');
                        },function(error){
                            utils.receive();
                        });
                    }
                }
              , remove:function(index){
                    utils.clean();
                    if($scope.notifiers.env.type=='element'){
                        utils.send('Send a remove request ...');
                        Resources.notifiers.remove({
                            server:$scope.notifier.id
                          , planner:$scope.notifier.planners[index]
                        },function(data){
                            utils.receive();
                            $scope.notifiers.get();
                            $scope.storage.planners[get_element(
                                $scope.notifier.planners[index],
                                $scope.storage.planners)[0]].follow=false;
                            utils.show('success','Planner removed to the list');
                        },function(error){
                            utils.receive();
                        });
                    }
                }
              , clean:function(index){
                    utils.clean();
                    utils.send('Cleaning planners list ...');
                    Resources.notifiers.clean({
                        server:$scope.notifier.id
                    },function(data){
                        utils.receive();
                        $scope.notifiers.get();
                        utils.show('success','Planners removed successfully');
                    },function(error){
                        utils.receive();
                    });
                }
            }
          , edit:function(index){
                $scope.notifiers.env.view='form';
                $scope.notifiers.env.type='element';
                $scope.notifier=$scope.storage.notifiers[index];
            }
          , remove:function(index){
                $scope.notifiers.env.view='remove';
                $scope.notifiers.env.type='element';
                $scope.notifier=$scope.storage.notifiers[index];
            }
          , delete:function(){
                utils.clean();
                if($scope.notifiers.env.type='element'){
                    utils.send('Sending delete request ...');
                    Resources.notifiers.delete({
                        notifier:$scope.notifier.id
                    },function(data){
                        $scope.notifiers.refresh();
                        $scope.notifiers.list();
                        utils.receive();
                        utils.show('success', 'Notifier removed to the list');
                    },function(error){
                        utils.receive();
                        utils.show('error',error.data.message);
                    });
                }
            }
        };

        $scope.dbservers.refresh();
        $scope.repositories.refresh();
        $scope.planners.refresh();
        $scope.notifiers.refresh();

        $scope.dbservers.show();
    }]
);

