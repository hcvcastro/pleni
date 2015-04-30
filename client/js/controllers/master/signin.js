'use strict';

pleni.controller('SigninController',
    ['$scope','$http','$window',
    function($scope,$http,$window){

    $('header>nav>ul:nth-child(1)>li').removeClass('active');
    $('header>nav>ul:nth-child(2)>li:nth-child(1)').addClass('active')
        .siblings().removeClass('active');

    $(function(){$('input[name=email]').focus();});

    utils.set_active('signin',1);

    $scope.email='';
    $scope.password='';

    $scope.signin=function(){
        $http.post('/signin',{
            email:$scope.email
          , password:$scope.password
          , _csrf:$('input[name=_csrf]').val()
        }).success(function(data){
            utils.show('success','Redirecting to projects page');
            $window.location.href='/#/projects';
        }).error(function(error){
            utils.show('error','Incorrect credentials');
        });
    };
}]);

