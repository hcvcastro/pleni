'use strict';

pleni.controller('SigninController',['$scope',function($scope){
    $('header>nav>ul:nth-child(1)>li').removeClass('active');
    $('header>nav>ul:nth-child(2)>li:nth-child(1)').addClass('active')
        .siblings().removeClass('active');

    utils.set_active('signin',1);
}]);

