'use strict';

var pleniApp=angular.module('PleniApp',['ngRoute','PleniControllers']);
pleniApp.config(['$routeProvider',function($routeProvider){
    $routeProvider
        .when('/home',{
            templateUrl:'/home',
            controller:'HomeController'
        })
        .when('/repositories',{
            templateUrl:'/repositories',
            controller:'RepositoriesController'
        })
        .when('/planners',{
            templateUrl:'/planners',
            controller:'PlannersController'
        })
        .otherwise({
            redirectTo: '/home'
        });
}]);

