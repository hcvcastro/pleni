'use strict';

var pleni=angular
    .module('PleniApp',['ngRoute','ngResource','ngAnimate','ngStorage'])
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
    }]);

