'use strict';

var pleni=angular
    .module('PleniApp',[
        'ngRoute','ngResource','ngAnimate','ngStorage','btford.socket-io'])
    .config(['$routeProvider',function($routeProvider){
        $routeProvider
            .when('/sites',{
                templateUrl:'/sites'
              , controller:'SitesController'
            })
            .otherwise({
                redirectTo: '/sites'
            });
    }]);

