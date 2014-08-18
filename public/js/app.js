'use strict';
// jQuery functions
var show_alert=function(type,message){
        $('.message').html(message)
        .parent().removeClass('hide')
                 .removeClass('alert-success alert-danger')
                 .addClass('alert-'+type);
    }
  , hide_alert=function(){
        $('div.alert').addClass('hide')
    }
  , to_waiting=function(){
        $('#test>span.loader').removeClass('hide');
        $('#test>span.result').removeClass('hide').html('');
    }
  , to_hide=function(mes1,mes2){
        $('#test>span.loader').addClass('hide');
        $('#test>span.result').removeClass('ok fail')
                              .addClass(mes1).html(mes2);
    }
  , focus=function(element){
        $(element).focus();
    }

// Angular functions
var pleniApp=angular.module('PleniApp',['ngRoute','ngResource'])
.config(['$routeProvider',function($routeProvider){
    $routeProvider
        .when('/home',{
            templateUrl:'/home',
            controller:'HomeController'
        })
        .when('/repositories',{
            templateUrl:'/repositories/view',
            controller:'RepositoriesController'
        })
        .when('/planners',{
            templateUrl:'/planners/view',
            controller:'PlannersController'
        })
        .otherwise({
            redirectTo: '/home'
        });
}])
.factory('Repositories',['$resource',function($resource){
    return $resource('/repositories/:repository',{
        repository:'@repository'
    },{
        update: {method:'PUT'}
    }
    );
}])
.controller('HomeController',['$scope',function($scope){}])
.controller('RepositoriesController',
    ['$scope','$http','Repositories',function($scope,$http,Repositories){
    $scope.env={
        panel:'index'
      , type:'index'
    };
    $scope.repository={
        id:''
      , host:''
      , port:''
      , dbuser:''
      , dbpass:''
      , prefix:''
    };
    $scope.current='';
    $scope.repositories={};
    Repositories.query(function(data){
        for(var i=0;i<data.length;i++){
            $scope.repositories[data[i].id]={
                host:data[i].host
              , port:data[i].port
              , prefix:data[i].prefix
              , status:'unknown'
              , databases:new Array()
            };
        }
    });

    $scope.add=function(){
        $scope.prepare('new','config');
        $scope.current='';
    };
    $scope.get=function(repository){
        $scope.prepare('view','view');
        $scope.current=repository;
    };
    $scope.save=function(){
        to_waiting();
        var connection=new Repositories();
        connection.host=$scope.repository.host;
        connection.port=$scope.repository.port;
        connection.dbuser=$scope.repository.dbuser;
        connection.dbpass=$scope.repository.dbpass;
        connection.prefix=$scope.repository.prefix;
        if($scope.env.panel=='new'){
            connection.id=$scope.repository.id;
            connection.$save(function(data){
                $scope.repositories[data.id]={
                    host:data.host
                  , port:data.port
                  , prefix:data.prefix
                  , status:'unknown'
                  , databases:new Array()
                };
                show_alert('success','Connection added');
                to_hide('ok','');
            },function(error){
                show_alert('danger',error.data.message);
                to_hide('fail','');
            });
        }else if($scope.env.panel=='view'){
            connection.$update({repository:$scope.current},function(data){
                $scope.repositories[$scope.current]={
                    host:data.host
                  , port:data.port
                  , prefix:data.prefix
                  , status:'unknown'
                  , databases:new Array()
                };
                show_alert('success','Connection updated');
                to_hide('ok','');
            },function(error){
                show_alert('danger',error.data.message);
                to_hide('fail','');
            });
        }
    };
    $scope.remove=function(){
        to_waiting();
        if($scope.env.panel='view'){
            var connection=new Repositories();
            connection.$delete({repository:$scope.current},function(data){
                delete $scope.repositories[$scope.current];
                $scope.current='';
                $scope.prepare('index','index');
                show_alert('success','Connection removed');
            },function(error){
                show_alert('danger',error.data.message);
                to_hide('fail','');
            });
        }
    };
    $scope.check=function(){
        to_waiting();
        if($scope.env.type=='config'){
            $http
            .post('/repositories/_check',{
                host:$scope.repository.host
              , port:$scope.repository.port
              , dbuser:$scope.repository.dbuser
              , dbpass:$scope.repository.dbpass
            })
            .success(function(data){
                to_hide('ok','ok');
            })
            .error(function(data){
                to_hide('fail','fail');
            });
        }else if($scope.env.type='view'){
            $http
            .post('/repositories/'+$scope.current+'/_check',{})
            .success(function(data){
                $scope.repositories[$scope.current].status='online';
                to_hide('ok','ok');
            })
            .error(function(data){
                $scope.repositories[$scope.current].status='offline';
                to_hide('fail','fail');
            });
        }
    };
    $scope.scan=function(){
        to_waiting();
        if($scope.env.panel='view'){
            $http
            .post('/repositories/'+$scope.current+'/_databases',{})
            .success(function(data){
                $scope.repositories[$scope.current].status='online';
                $scope.repositories[$scope.current].databases=data;
                to_hide('ok','complete');
            })
            .error(function(data){
                $scope.repositories[$scope.current].status='offline';
                to_hide('fail','fail');
            });
        }
    };
    $scope.view=function(){
        if($scope.env.type!='view'){
            $scope.prepare('view','view');
        }
    };
    $scope.edit=function(){
        if($scope.env.type!='config'){
            $scope.prepare('view','config');
            $scope.repository={
                id:$scope.current
              , host:$scope.repositories[$scope.current].host
              , port:parseInt($scope.repositories[$scope.current].port)
              , dbuser:''
              , dbpass:''
              , prefix:$scope.repositories[$scope.current].prefix
            };
        }
    };
    $scope.delete=function(){
        if($scope.env.type!='delete'){
            $scope.prepare('view','delete');
        }
    };
    $scope.prepare=function(panel,type){
        to_hide('fail','');
        hide_alert();
        $scope.env={panel:panel,type:type};
    };
}])
.factory('Planners',['$resource',function($resource){
    return $resource('/planners/:planner',{
        repository:'@planner'
    },{
        update: {method:'PUT'}
    }
    );
}])
.controller('PlannersController',
    ['$scope','$http','Planners',function($scope,$http,Planners){
    $scope.env={
        panel:'index'
      , type:'index'
    };
    $scope.planner={
        id:''
      , host:''
      , port:''
    };
    $scope.current='';
    $scope.planners={};
    Planners.query(function(data){
        for(var i=0;i<data.length;i++){
            $scope.planners[data[i].id]={
                host:data[i].host
              , port:data[i].port
              , status:'unknown'
            };
        }
    });
}]);

