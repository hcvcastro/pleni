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
        return $resource('/resources/dbservers/:dbserver/:action',{
            dbserver:'@dbserver'
          , action:'@action'
        },{
            update:{method:'PUT'}
          , check:{method:'POST',params:{action:'_check'}}
          , scan:{method:'POST',params:{action:'_databases'},isArray:true}
        });
    }])
    .controller('ResourcesController',
        ['$scope','$sessionStorage','DBServers',
        function($scope,$sessionStorage,DBServers){
            $scope.storage=$sessionStorage;
            $('header nav ul li:nth-child(2)').addClass('active')
                .siblings().removeClass('active');

            $scope.dbservers={
                show:function(){
                    $('section.dbservers').addClass('active')
                        .siblings().removeClass('active');
                    $('nav.menu>ul>li:nth-child(1)').addClass('active')
                        .siblings().removeClass('active');
                    if(!$scope.storage.dbservers){
                        
                    }
                }
              , refresh:function(){
                    DBServers.query(function(data){
                        $scope.dbservers=new Array();
                        for(var i=0;i<data.length;i++){
                            $scope.dbservers.push({
                                id:data[i].id
                              , db:{
                                    host:data[i].db.host
                                  , port:data[i].db.port
                                  , prefix:data[i].db.prefix
                                }
                              , status:'unknown'
                            });
                        }
                    });
                }
            };

            $scope.repositories={
                show:function(){
                    $('section.repositories').addClass('active')
                        .siblings().removeClass('active');
                    $('nav.menu>ul>li:nth-child(2)').addClass('active')
                        .siblings().removeClass('active');
                }
            };

            $scope.planners={
                show:function(){
                    $('section.planners').addClass('active')
                        .siblings().removeClass('active');
                    $('nav.menu>ul>li:nth-child(3)').addClass('active')
                        .siblings().removeClass('active');
                }
            };

            $scope.iopipes={
                show:function(){
                    $('section.iopipes').addClass('active')
                        .siblings().removeClass('active');
                    $('nav.menu>ul>li:nth-child(4)').addClass('active')
                        .siblings().removeClass('active');
                }
            };

            $scope.dbservers.show();
        }]
    )
    .controller('TasksController',
        ['$scope','$sessionStorage',
        function($scope,$sessionStorage){
            $('header nav ul li:nth-child(3)').addClass('active')
                .siblings().removeClass('active');

        }]
    )

