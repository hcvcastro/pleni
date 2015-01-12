'use strict';

var pleni=angular
    .module('PleniApp',[
        'ngRoute','ngResource','ngAnimate','ngStorage','btford.socket-io'])
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
            .when('/activities',{
                templateUrl:'/activities/view',
                controller:'ActivitiesController'
            })
            .otherwise({
                redirectTo: '/home'
            });
    }]);

