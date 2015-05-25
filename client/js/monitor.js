'use strict';

var pleni=angular
    .module('PleniApp',[
        'ngRoute','ngResource','ngStorage','ngCookies','btford.socket-io'])
    .config(['$routeProvider',function($routeProvider){
        $routeProvider
            .when('/home',{
                templateUrl:'/home'
              , controller:'HomeController'
              , access:'everyone'
            })
            .otherwise({
                redirectTo:'/home'
            });
    }])
    .run(['$rootScope','$location','Auth',function($rootScope,$location,Auth){
        $rootScope.$on('$routeChangeStart',function(event,next,current){
            switch(next.access){
                case 'everyone':
                    break;
                case 'guest':
                    if(Auth.isUser('monitr')){
                        $location.path('/');
                    }
                    break;
                case 'user':
                    if(!Auth.isUser('monitr')){
                        $location.path('/signin');
                    }
                    break;
            }
        });
    }]);

