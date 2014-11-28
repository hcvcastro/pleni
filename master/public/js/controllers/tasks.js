'use strict';

pleni.controller('TasksController',
    ['$scope','$sessionStorage',
    function($scope,$sessionStorage){
        $('header nav ul li:nth-child(3)').addClass('active')
            .siblings().removeClass('active');

    }]
);

