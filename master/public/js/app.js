'use strict';

var utils={
    show:function(type,message){
        var message='<div class="'+type+'"><div class="close">'
            +'<a onclick=\'utils.hide(this)\' class="fa fa-close"></a>'
            +'</div><p>'+message+'</p></div>';
        $('section.messages').append(message);
    }
  , hide:function(element){
        $(element).parent().parent().remove();
    }
  , clean:function(){
        $('section.messages').empty();
    }
  , send:function(message){
        $('p.offset>.message').html(message);
        $('p.offset>.hide').removeClass('hide');
    }
  , receive:function(){
        $('p.offset>span').addClass('hide');
    }
};

angular
    .module('PleniApp',['ngRoute','ngResource','ngStorage'])
    .config(['$routeProvider',function($routeProvider){
        $routeProvider
            .when('/home',{
                templateUrl:'/home',
                controller:'HomeController'
            })
            .when('/resources',{
                templateUrl:'/resources/view',
                controller:'ResourcesController'
            })
            .when('/tasks',{
                templateUrl:'/tasks/view',
                controller:'TasksController'
            })
            .otherwise({
                redirectTo: '/home'
            });
    }])
    .controller('HomeController',['$scope',function($scope){
        $('header nav ul li:nth-child(1)').addClass('active')
            .siblings().removeClass('active');
    }])
    .factory('DBServers',['$resource',function($resource){
        return $resource('/resources/dbservers/:dbserver/:action',{
            dbserver:'@dbserver'
          , action:'@action'
        },{
            update:{method:'PUT'}
          , check:{method:'POST',params:{action:'_check'}}
          , scan:{method:'POST',params:{action:'_databases'},isArray:true}
        });
    }])
    .controller('ResourcesController',
        ['$scope','$sessionStorage','DBServers',
        function($scope,$sessionStorage,DBServers){
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
                              , status:'unknown'
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
                    }else if($scope.dbservers.env.view=='list'){
                        var dbserver=$scope.storage.dbservers[index];
                        DBServers.check({dbserver:dbserver.id},function(data){
                            dbserver.status='online';
                        },function(error){
                            dbserver.status='offline';
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
                            $scope.dbserver.status='online';
                            $scope.dbserver.repositories=data;
                            utils.receive();
                            if(data.length==0){
                                utils.show('warning','Repositories not found');
                            }
                        },function(error){
                            $scope.dbserver.status='offline';
                            utils.receive();
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
                        console.log($scope.dbserver);
                        DBServers.delete({dbserver:$scope.dbserver.id},
                        function(data){
                            $scope.dbservers.refresh();
                            $scope.dbservers.list();
                            utils.receive();
                            utils.show('success',
                                'DB server removed to the list');
                        },function(error){
                            utils.receive();
                            utils.show('error',error.data.message);
                        });
                    }
                }
            };

            $scope.repositories={
                show:function(){
                    $('section.repositories').addClass('active')
                        .siblings().removeClass('active');
                    $('nav.menu>ul>li:nth-child(2)').addClass('active')
                        .siblings().removeClass('active');
                }
            };

            $scope.planners={
                show:function(){
                    $('section.planners').addClass('active')
                        .siblings().removeClass('active');
                    $('nav.menu>ul>li:nth-child(3)').addClass('active')
                        .siblings().removeClass('active');
                }
            };

            $scope.iopipes={
                show:function(){
                    $('section.iopipes').addClass('active')
                        .siblings().removeClass('active');
                    $('nav.menu>ul>li:nth-child(4)').addClass('active')
                        .siblings().removeClass('active');
                }
            };

            $scope.dbservers.show();
        }]
    )
    .controller('TasksController',
        ['$scope','$sessionStorage',
        function($scope,$sessionStorage){
            $('header nav ul li:nth-child(3)').addClass('active')
                .siblings().removeClass('active');

        }]
    )

