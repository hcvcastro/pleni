'use strict';

pleni.controller('SigninController',
    ['$scope','$http','$window',
    function($scope,$http,$window){
    utils.set_tab(1,1);
    utils.set_active('signin',1);

    $('input[name=email]').focus();

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

