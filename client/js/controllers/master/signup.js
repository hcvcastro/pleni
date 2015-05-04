'use strict';

pleni.controller('SignupController',['$scope','Auth',function($scope,Auth){
    utils.set_tab(1,2);
    utils.set_active('signup',1);

    $('input[name=email]').focus();

    $scope.email='';
    $scope.password='';
    $scope.confirm='';
    $scope.recaptcha='';

    $scope.signup=function(){
        if($scope.password===$scope.confirm){
            Auth.signup($scope.email,$scope.password,
                $('input[name=_csrf]').val(),$scope.recaptcha);
        }else{
            utils.show('warning','Passwords are slightly different');
        }
    };
}]);

