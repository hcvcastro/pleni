'use strict';

pleni.controller('SigninController',['$scope','Auth',function($scope,Auth){
    utils.set_tab(1,1);
    utils.set_active('signin',1);

    $('input[name=email]').focus();

    $scope.email='';
    $scope.password='';

    $scope.signin=function(){
        Auth.signin($scope.email,$scope.password,$('input[name=_csrf]').val());
    };
}]);

