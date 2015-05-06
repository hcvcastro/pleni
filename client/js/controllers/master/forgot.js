'use strict';

pleni.controller('ForgotController',['$scope','Auth',function($scope,Auth){
    utils.set_tab(1,2);
    utils.set_active('forgot',1);

    $('input[name=email]').focus();

    $scope.email='';
    $scope.recaptcha='';
    $scope.control={};

    $scope.forgot=function(){
        utils.send('Sending forgot request ...');
        Auth.forgot($scope.email,
            $('input[name=_csrf]').val(),
            $scope.recaptcha,$scope.control.reset,
            function(){
                utils.receive();
            });
    };
}]);

