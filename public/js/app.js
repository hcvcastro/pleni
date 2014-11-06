'use strict';

// Angular functions
var pleniApp=angular.module('PleniApp',['ngRoute','ngResource','ngStorage'])
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
        .otherwise({
            redirectTo: '/home'
        });
}])
.controller('HomeController',['$scope',function($scope){
    $('header nav ul li').removeClass('active');
}])
.controller('ResourcesController',
    ['$scope','$sessionStorage',
    function($scope,$sessionStorage){
    $('header nav ul li').removeClass('active');
    $('header nav ul li:nth-child(1)').addClass('active');
}])

