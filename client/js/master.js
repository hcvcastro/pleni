'use strict';

var pleni=angular
    .module('PleniApp',[
        'ngRoute','ngResource','ngAnimate','ngStorage','btford.socket-io'])
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
            .otherwise({
                redirectTo: '/home'
            });
    }]);

/*var authed=function($q,$rootScope,$location,$http){
    if($rootScope.user){
        return true;
    }else{
        var deferred=$q.defer();

        $http.post('/user')
        .success(function(response){
            $rootScope.user=response.user;
            deferred.resolve(true);
        })
        .error(function(){
            deferred.reject();
            $location.path('/signin');
        });

        return deferred.promise;
    }
};*/

