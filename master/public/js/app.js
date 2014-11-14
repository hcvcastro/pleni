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

    $scope.show_dbservers=function(){
        $('section.dbservers').addClass('active')
            .siblings().removeClass('active');
    }
    $scope.show_repositories=function(){
        $('section.repositories').addClass('active')
            .siblings().removeClass('active');
    }
    $scope.show_planners=function(){
        $('section.planners').addClass('active')
            .siblings().removeClass('active');
    }
    $scope.show_iopipes=function(){
        $('section.iopipes').addClass('active')
            .siblings().removeClass('active');
    }
}])

