'use strict';

pleni.controller('ResetController',['$scope','$routeParams','$http','Auth',
    function($scope,$routeParams,$http,Auth){
    utils.set_tab(1,2);
    utils.set_active('reset',1);

    $scope.email='';
    $scope.password='';
    $scope.confirm='';
    $scope.recaptcha='';
    $scope.control={};

    $scope.reset=function(){
        if($scope.password===$scope.confirm){
            utils.send('Sending reset request ...');
            Auth.reset($routeParams.key,$scope.email,
                $scope.password,
                $('input[name=_csrf]').val(),
                $scope.recaptcha,$scope.control.reset,
                function(){
                    utils.receive();
                });
        }else{
            utils.show('warning','Passwords are slightly different');
            utils.receive();
        }
    }
}]);

