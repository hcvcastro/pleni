'use strict';

var pleniApp=angular.module('PleniApp',['ngRoute','PleniControllers']);
pleniApp.config(['$routeProvider',function($routeProvider){
    $routeProvider
        .when('/home',{
            templateUrl:'/home',
            controller:'SettingsController'
        })
        .when('/settings',{
            templateUrl:'/settings',
            controller:'SettingsController'
        })
        .when('/fetch',{
            templateUrl:'/fetch',
            controller:'FetchController'
        })
        .otherwise({
            redirectTo: '/home'
        });
}]);

