'use strict';

var pushy=new pushy();

var pleni=angular
    .module('PleniApp',['ui.router'])
    .config(function($stateProvider,$urlRouterProvider){
        $urlRouterProvider.otherwise('/search');

        $stateProvider
            .state('search',{
                url:'/search'
              , templateUrl:'pages/search'
            })
            .state('sitemap',{
                url:'/sitemap'
              , templateUrl:'pages/sitemap'
            })
            .state('about',{
                url:'/about'
              , templateUrl:'pages/about'
            })
            .state('report',{
                url:'/report'
              , templateUrl:'pages/report'
            })
    });

