'use strict';

var pleniApp=angular.module('PleniApp',['ngRoute'])
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
.factory('Repositories',function($http){
    return {
        list:function(params){return $http.get('/repositories')}
    };
})
.controller('HomeController',['$scope',function($scope){}])
.controller('RepositoriesController',
    ['$scope','$http','Repositories',function($scope,$http,Repositories){

    $scope.panel='index';
    $scope.repositories={};

    Repositories.list().then(function(result){
        $scope.repositories=result.data;
    });
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
