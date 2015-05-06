'use strict';

pleni.controller('ForgotController',['$scope','Auth',function($scope,Auth){
    utils.set_tab(1,2);
    utils.set_active('forgot',1);

    $('input[name=email]').focus();

    $scope.email='';
    $scope.recaptcha='';
    $scope.control={};

    $scope.forgot=function(){
        if($scope.password===$scope.confirm){
            utils.send('Sending forgot request ...');
            Auth.signup($scope.email,$scope.password,
                $('input[name=_csrf]').val(),
                $scope.recaptcha,$scope.control.reset,
                function(){
                    utils.receive();
                });
        }
    };
}]);

