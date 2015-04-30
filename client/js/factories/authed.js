'use strict';

pleni.factory('Authed',['$q','$rootScope','$location','$http',
    function($q,$rootScope,$location,$http){
        if($rootScope.user){
            return true;
        }else{
            var deferred=$q.defer();

            $http.post('/user')
            .success(function(response){
                $rootScope.user=response.user;
                deferred.resolve(true);
            })
            .error(function(){
                deferred.reject();
                $location.path('/signin');
            });

            return deferred.promise;
        }
    }]);

