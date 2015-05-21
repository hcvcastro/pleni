'use strict';

pleni.controller('SettingsController',['$scope','Auth',function($scope,Auth){
    utils.set_tab(1,1);
    utils.set_active('settings',1);
    utils.set_header(true);

    $('input[name=password1]').focus();

    $scope.password1='';
    $scope.password2='';
    $scope.confirm='';

    $scope.change=function(){
        if($scope.password2===$scope.confirm){
            utils.send('Sending change request ...');
            Auth.change($scope.password1,$scope.password2,
                $('input[name=_csrf]').val(),function(){
                utils.receive();
            });
        }else{
            utils.show('warning','Passwords are slightly different');
            utils.receive();
        }
    }
}]);

