'use strict';

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
        save:{
            method:'PUT'
        }
    }
    );
}])
.controller('HomeController',['$scope',function($scope){}])
.controller('RepositoriesController',
    ['$scope','$http','Repositories',function($scope,$http,Repositories){
    $scope.repositories=Repositories.query();
    $scope.id='';
    $scope.host='';
    $scope.dbuser='';
    $scope.dbpass='';
    $scope.prefix='';

    $scope.add=function(){
        $scope.title='Add connection';
        $scope.type='add';
    };
    $scope.get=function(repository){
        Repositories.get({repository:repository},function(repository){
            $scope.title='Repository: '+repository.id;
            $scope.type='get';
            $scope.id=repository.id;
            $scope.host=repository.host;
            $scope.port=parseInt(repository.port);
            $scope.prefix=repository.prefix;
        });
    };
    $scope.send=function(){
        if($scope.type=='add'){
            var connection=new Repositories();
            connection.id=$scope.id;
            connection.host=$scope.host;
            connection.dbuser=$scope.dbuser;
            connection.dbpass=$scope.dbpass;
            connection.prefix=$scope.prefix;
            connection.$save();
        }
    };
}])
.controller('PlannersController',
    ['$scope','$http',function($scope,$http){
}]);

/*
    var showWaiting=function(){
        $('#test>span.loader').removeClass('hide');
        $('#test>span.result').removeClass('hide').html('');
    };
    var hideWaiting=function(mes1,mes2){
        $('#test>span.loader').addClass('hide');
        $('#test>span.result').removeClass('ok fail')
                              .addClass(mes1).html(mes2);
    };
    var showAlert=function(type,message){
        $('.message').html(message)
            .parent().removeClass('hide')
                     .removeClass('alert-success alert-danger')
                     .addClass('alert-'+type);
    }

    $scope.testdb=function(){
        showWaiting();
        $http.post('/settings/testdb',{host:$scope.host,port:$scope.port})
            .success(function(data){
                if(data.result){
                    hideWaiting('ok','OK');
                }else{
                    hideWaiting('fail',data.message);
                }
            })
            .error(function(){
                hideWaiting('fail','Error');
            });
    };

    $scope.savedb=function(){
        showWaiting();
        $http.post('/settings/savedb',
            {host:$scope.host,port:$scope.port,prefix:$scope.prefix})
            .success(function(data){
                hideWaiting('ok','');
                if(data.result){
                    showAlert('success',data.message);
                }else{
                    showAlert('danger',data.message);
                }
            })
            .error(function(){
                hideWaiting('fail','');
                showAlert('danger','Connection error');
            });

    };



    $scope.showindex=function(){$scope.panel='index';};
    $scope.showcreate=function(){$scope.panel='create';};

    $scope.createrepo=function(){
        $http.post('/repositories',
            {repository:$scope.repository})
            .success(function(data){
                console.log('created');
            });
    };
*/
