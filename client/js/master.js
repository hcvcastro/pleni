'use strict';

var pleni=angular
    .module('PleniApp',[
        'ngRoute','ngResource','ngAnimate'
      , 'ngStorage','ngCookies','btford.socket-io'
      , 'noCAPTCHA'])
    .config(['$routeProvider',function($routeProvider){
        $routeProvider
            .when('/home',{
                templateUrl:'/home'
              , controller:'HomeController'
              , access:'everyone'
            })
            .when('/signin',{
                templateUrl:'/signin'
              , controller:'SigninController'
              , access:'guest'
            })
            .when('/signup',{
                templateUrl:'/signup'
              , controller:'SignupController'
              , access:'guest'
            })
            .when('/resources',{
                templateUrl:'/resources/view'
              , controller:'ResourcesController'
              , access:'user'
            })
            .when('/projects',{
                templateUrl:'/projects/view'
              , controller:'ProjectsController'
              , access:'user'
            })
            .when('/projects/:project',{
                templateUrl:'/workspace/view'
              , controller:'WorkspaceController'
              , access:'user'
            })
            .when('/pages/:page',{
                templateUrl:function(params){
                    return '/static/'+params.page;
                }
              , controller:'StaticController'
            })
            .otherwise({
                redirectTo: '/home'
            });
    }])
    .run(['$rootScope','$location','Auth',function($rootScope,$location,Auth){
        $rootScope.$on('$routeChangeStart',function(event,next,current){
            switch(next.access){
                case 'everyone':
                    break;
                case 'guest':
                    if(Auth.isUser()){
                        $location.path('/');
                    }
                    break;
                case 'user':
                    if(!Auth.isUser()){
                        $location.path('/signin');
                    }
                    break;
            }
        });
    }]);

