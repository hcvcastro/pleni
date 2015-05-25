'use strict';

pleni.controller('HomeController',['$rootScope','$scope','Auth',
    function($rootScope,$scope,Auth){
    utils.set_tab(0,1);
    utils.set_header(true);

    if(Auth.isUser('monitr')){
        utils.set_active('manager',1);
    }else{
        utils.set_active('signin',1);
    }

    $('input[name=email]').focus();

    if($rootScope.flash){
        utils.show($rootScope.flash[0],$rootScope.flash[1]);
        delete $rootScope.flash;
    }

    $scope.email='';
    $scope.password='';

    $scope.signin=function(){
        utils.send('Trying login into account ...');
        Auth.signin($scope.email,$scope.password,$('input[name=_csrf]').val(),
            function(){
                utils.receive();
            });
    };
}]);

