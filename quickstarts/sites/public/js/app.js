'use strict';

var pushy=new pushy();

var pleni=angular
    .module('PleniApp',['ngRoute'])
    .config(['$routeProvider',function($routeProvider){
        var match=/pleni.url=(.+)/.exec(document.cookie)
          , site='/sites'

        if(match&&match.length==2){
            site='/map';
        }

        $routeProvider
            .when('/sites',{
                templateUrl:'/sites'
              , controller:'SitesController'
            })
            .when('/map',{
                templateUrl:'/map'
              , controller:'MapController'
            })
            .when('/about',{
                templateUrl:'/about'
            })
            .when('/report',{
                templateUrl:'/report'
              , controller:'ReportController'
            })
            .otherwise({
                redirectTo:site
            });
    }]);

