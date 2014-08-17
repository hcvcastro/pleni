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
            templateUrl:'/planners',
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
    }
    );
}])
.controller('HomeController',['$scope',function($scope){}])
.controller('RepositoriesController',
    ['$scope','$http','Repositories',function($scope,$http,Repositories){
    $scope.env={
        panel:'index'
      , type:''
    };
    $scope.repository={
        id:''
      , host:''
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
        $scope.prepare('view','get');
        $scope.current=repository;
    };
    $scope.save=function(){
        to_waiting();
        if($scope.env.panel=='new'){
            var connection=new Repositories();
            connection.id=$scope.repository.id;
            connection.host=$scope.repository.host;
            connection.port=$scope.repository.port;
            connection.dbuser=$scope.repository.dbuser;
            connection.dbpass=$scope.repository.dbpass;
            connection.prefix=$scope.repository.prefix;
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
            
        }
    };
    $scope.check=function(){
        to_waiting();
        if($scope.env.panel=='new'){
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
        }else if($scope.env.panel='view'){
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
                $scope.repositories[$scope.current].databases=data;
                to_hide('ok','complete');
            })
            .error(function(data){
                $scope.repositories[$scope.current].status='offline';
                to_hide('fail','fail');
            });
        }
    };
    $scope.prepare=function(panel,type){
        to_hide('fail','');
        hide_alert();
        $scope.env={panel:panel,type:type};
    };
}])
.controller('PlannersController',
    ['$scope','$http',function($scope,$http){
}]);

