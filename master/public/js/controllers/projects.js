'use strict';

pleni.controller('ProjectsController',
    ['$scope','$sessionStorage',
    function($scope,$sessionStorage){
        $scope.storage=$sessionStorage;

        $('header>nav>ul:nth-child(2)>li').removeClass('active')
        $('header>nav>ul:nth-child(1)>li:nth-child(3)').addClass('active')
            .siblings().removeClass('active');

        $scope.view={
            show:function(){
                utils.set_active('projects',1);
            }
        }

        $scope.view.show();
    }]
);

