'use strict';

var pleni=angular
    .module('PleniApp',[
        'ngRoute','ngResource','ngStorage','btford.socket-io'])
    .config(['$routeProvider',function($routeProvider){
        $routeProvider
            .when('/sites',{
                templateUrl:'/sites'
              , controller:'SitesController'
            })
            .when('/map',{
                templateUrl:'/map'
              , controller:'MapController'
            })
            .otherwise({
                redirectTo: '/sites'
            });
    }]);

