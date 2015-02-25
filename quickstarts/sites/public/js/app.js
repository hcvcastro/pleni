'use strict';

var pushy=new pushy();
$('.close').click(function(){
    pushy.togglePushy();
});

var pleni=angular
    .module('PleniApp',['ngRoute','btford.socket-io'])
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
            .otherwise({
                redirectTo:site
            });
    }]);

