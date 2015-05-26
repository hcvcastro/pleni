'use strict';

pleni.controller('HeaderController',['$scope','Auth',function($scope,Auth){
        $scope.status=function(index){
            var auth=Auth.isUser('monitr');

            switch(index){
                case 1:
                    return 'enabled';
                case 2:
                    return auth==true? 'enabled':'';
            }
        }

        $scope.signout=function(){
            Auth.signout('monitr',function(){
                location.reload();
            });
        }
    }]
);

