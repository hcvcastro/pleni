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
            .state('mapsite',{
                url:'/mapsite'
              , templateUrl:'pages/mapsite'
            })
    });

