'use strict';

pleni.controller('HomeController',
    ['$scope','$sessionStorage','Auth','Resources',
    function($scope,$sessionStorage,Auth,Resources){
    utils.set_tab(0,1);
    utils.set_header(true);

    if(!Auth.isUser('monitr')){
        utils.set_active('signin',1);

        $('input[name=email]').focus();

        $scope.email='';
        $scope.password='';

        $scope.signin=function(){
            utils.send('Trying login into account ...');
            Auth.signin($scope.email,$scope.password,
                $('input[name=_csrf]').val(),
                function(){
                    location.reload();
                });
        };
    }else{
        $scope.storage=$sessionStorage;
    }
}]);

