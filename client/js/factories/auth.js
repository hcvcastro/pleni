'use strict';

pleni.factory('Auth',['$http','$cookieStore','$location',
    function($http,$cookieStore,$location){
    return {
        isUser:function(){
            var auth=$cookieStore.get('pleni.auth');
            return auth!==undefined;
        }
      , signin:function(email,password,csrf){
            $http.post('/signin',{
                email:email
              , password:password
              , _csrf:csrf
            })
            .success(function(data){
                utils.show('success','Redirecting to projects list ...');
                $location.path('/');
            })
            .error(function(error){
                utils.show('error','Incorrect credentials');
            });
        }
      , signout:function(){
            $http.post('/signout')
            .success(function(data){
                $cookieStore.remove('pleni.auth');
                $location.path('/signin');
            })
            .error(function(error){
                utils.show('error','Invalid request');
            });
        }
    };
}]);

