'use strict';

pleni.controller('TasksController',
    ['$scope','$sessionStorage',
    function($scope,$sessionStorage){
        $('header>nav>ul:nth-child(2)>li').removeClass('active')
        $('header>nav>ul:nth-child(1)>li:nth-child(3)').addClass('active')
            .siblings().removeClass('active');
    }]
);

