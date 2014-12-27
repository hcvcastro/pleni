'use strict';

pleni.controller('HomeController',['$scope',function($scope){
    $('header>nav>ul:nth-child(2)>li').removeClass('active')
    $('header>nav>ul:nth-child(1)>li:nth-child(1)').addClass('active')
        .siblings().removeClass('active');
}]);

