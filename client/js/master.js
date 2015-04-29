'use strict';

var pleni=angular
    .module('PleniApp',[
        'ngRoute','ngResource','ngAnimate','ngStorage','btford.socket-io'])
    .config(['$routeProvider',function($routeProvider){
        $routeProvider
            .when('/home',{
                templateUrl:'/home'
              , controller:'HomeController'
            })
            .when('/signin',{
                templateUrl:'/signin'
              , controller:'SigninController'
            })
            .when('/signup',{
                templateUrl:'/signup'
              , controller:'SignupController'
            })
            .when('/resources',{
                templateUrl:'/resources/view'
              , controller:'ResourcesController'
            })
            .when('/projects',{
                templateUrl:'/projects/view'
              , controller:'ProjectsController'
            })
            .when('/projects/:project',{
                templateUrl:'/workspace/view'
              , controller:'WorkspaceController'
            })
            .otherwise({
                redirectTo: '/home'
            });
    }]);

