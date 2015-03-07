'use strict';

pleni.controller('MenuController',
    ['$scope','$rootScope','$http','$location','$window',
    function($scope,$rootScope,$http,$location,$window){
        $scope.$on('$locationChangeStart',function(event,next,current){
            if(current.indexOf('/#/map')!=-1&&next.indexOf('/#/sites')!=-1){
                $scope.close(true);
            }
        });

        $scope.items=[1,0,0,0,0,1];

        $scope.menu=function(){
            var hash=window.location.hash.substring(1);

            switch(hash){
                case '/about':
                    $scope.items=[1,0,0,0,1,0];
                    break;
                case '/map':
                    $scope.items=[1,1,1,1,0,1];
                    break;
                case '/sites':
                    $scope.items=[1,0,0,0,0,1];
            }

            pushy.togglePushy();
        }

        $scope.hide=function(){
            pushy.togglePushy();
        }

        $scope.about=function(){
            pushy.togglePushy();
            $location.path('about');
        }

        $scope.home=function(){
            pushy.togglePushy();
            $location.path('');
        }

        $scope.close=function(pushy){
            if(!pushy){
                pushy.togglePushy();
            }
            $http.delete('/').success(function(){
                $location.path('sites');
                $window.location.reload();
            });
        };

        $scope.report=function(){
            pushy.togglePushy();
            $location.path('report');
        }

        $scope.more=function(){
            pushy.togglePushy();
            $http.put('/more').success(function(data){
                $rootScope.monitor=data.msg+' ';
                if(data.queue==0){
                    $rootScope.monitor+='. starting ...';
                }else{
                    $rootScope.monitor+='(aprox:'+data.queue+' minutes)';
                }

                $location.path('/map');
            });
        }

        $scope.refresh=function(){
            $window.location.reload();
        }
}]);

