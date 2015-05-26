'use strict';

pleni.controller('HeaderController',['$scope','Auth',function($scope,Auth){
        $scope.status=function(index){
            var auth=Auth.isUser('mastr');

            switch(index){
                case 1:
                    return 'enabled';
                case 2:
                case 3:
                case 4:
                case 5:
                    return auth==true? 'enabled':'';
                case 6:
                case 7:
                    return auth==false? 'enabled':'';
            }
        }

        $scope.signout=function(){
            Auth.signout('mastr',function(){});
        }
    }]
);

