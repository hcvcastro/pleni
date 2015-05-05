'use strict';

pleni.controller('SignupController',['$scope','Auth',function($scope,Auth){
    utils.set_tab(1,2);
    utils.set_active('signup',1);

    $('input[name=email]').focus();

    $scope.email='';
    $scope.password='';
    $scope.confirm='';
    $scope.recaptcha='';
    $scope.control={};

    $scope.signup=function(){
        if($scope.password===$scope.confirm){
            utils.send('Registering new account ...');
            Auth.signup($scope.email,$scope.password,
                $('input[name=_csrf]').val(),
                $scope.recaptcha,$scope.control.reset,
                function(){
                    utils.receive();
                });
        }else{
            utils.show('warning','Passwords are slightly different');
            utils.receive();
        }
    };
}]);

