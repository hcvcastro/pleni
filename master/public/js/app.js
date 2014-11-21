'use strict';

angular
    .module('PleniApp',['ngRoute','ngResource','ngStorage'])
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
            .when('/tasks',{
                templateUrl:'/tasks/view',
                controller:'TasksController'
            })
            .otherwise({
                redirectTo: '/home'
            });
    }])
    .controller('HomeController',['$scope',function($scope){
        $('header nav ul li:nth-child(1)').addClass('active')
            .siblings().removeClass('active');
    }])
    .factory('DBServers',['$resource',function($resource){
        return $resource('/dbservers/:dbserver/:action',{
            repository:'@repository'
          , action:'@action'
        },{
            update:{method:'PUT'}
          , check:{method:'POST',params:{action:'_check'}}
          , scan:{method:'POST',params:{action:'_databases'},isArray:true}
        });
    }])
    .controller('ResourcesController',
        ['$scope','$sessionStorage',
        function($scope,$sessionStorage){
            $('header nav ul li:nth-child(2)').addClass('active')
                .siblings().removeClass('active');

            $scope.show_dbservers=function(){
                $('section.dbservers').addClass('active')
                    .siblings().removeClass('active');
                $('nav.menu>ul>li:nth-child(1)').addClass('active')
                    .siblings().removeClass('active');
            }
            $scope.show_repositories=function(){
                $('section.repositories').addClass('active')
                    .siblings().removeClass('active');
                $('nav.menu>ul>li:nth-child(2)').addClass('active')
                    .siblings().removeClass('active');
            }
            $scope.show_planners=function(){
                $('section.planners').addClass('active')
                    .siblings().removeClass('active');
                $('nav.menu>ul>li:nth-child(3)').addClass('active')
                    .siblings().removeClass('active');
            }
            $scope.show_iopipes=function(){
                $('section.iopipes').addClass('active')
                    .siblings().removeClass('active');
                $('nav.menu>ul>li:nth-child(4)').addClass('active')
                    .siblings().removeClass('active');
            }

            $scope.show_dbservers();
        }]
    )
    .controller('TasksController',
        ['$scope','$sessionStorage',
        function($scope,$sessionStorage){
            $('header nav ul li:nth-child(3)').addClass('active')
                .siblings().removeClass('active');

        }]
    )

