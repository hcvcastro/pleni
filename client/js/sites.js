'use strict';

var pushy=new pushy();

var pleni=angular
    .module('PleniApp',['ui.router'])
    .config(['$stateProvider','$urlRouterProvider'
        ,function($stateProvider,$urlRouterProvider){
        $urlRouterProvider.otherwise('/search');

        $stateProvider
            .state('search',{
                url:'/search'
              , templateUrl:'pages/search'
              , data:{
                    view:'search'
                }
            })
            .state('sitemap',{
                url:'/sitemap'
              , templateUrl:'pages/sitemap'
              , data:{
                    view:'sitemap'
                }
            })
            .state('about',{
                url:'/about'
              , templateUrl:'pages/about'
            })
            .state('report',{
                url:'/report'
              , templateUrl:'pages/report'
            })
    }]);

