'use strict';

pleni.controller('SignupController',['$scope',function($scope){
    $('header>nav>ul:nth-child(1)>li').removeClass('active');
    $('header>nav>ul:nth-child(2)>li:nth-child(2)').addClass('active')
        .siblings().removeClass('active');

    utils.set_active('signup',1);
}]);

