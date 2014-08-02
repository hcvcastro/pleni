'use strict';

var pleniApp=angular.module('PleniApp',['ngRoute','PleniControllers']);
pleniApp.config(['$routeProvider',function($routeProvider){
    $routeProvider
        .when('/home',{
            templateUrl:'/home',
            controller:'HomeController'
        })
        .when('/settings',{
            templateUrl:'/settings',
            controller:'SettingsController'
        })
        .when('/repositories',{
            templateUrl:'/repositories',
            controller:'RepositoriesController'
        })
        .otherwise({
            redirectTo: '/home'
        });
}]);

