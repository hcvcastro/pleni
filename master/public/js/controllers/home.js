'use strict';

pleni.controller('HomeController',['$scope',function($scope){
    $('header nav ul li:nth-child(1)').addClass('active')
        .siblings().removeClass('active');
}]);

