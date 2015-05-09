'use strict';

pleni.factory('Auth',['$rootScope','$http','$cookieStore','$location',
    function($rootScope,$http,$cookieStore,$location){
    return {
        isUser:function(){
            var auth=$cookieStore.get('pleni.auth');
            return auth!==undefined;
        }
      , signin:function(email,password,csrf,done){
            $http.post('/signin',{
                email:email
              , password:password
              , _csrf:csrf
            })
            .success(function(data){
                $location.path('/');
                done();
            })
            .error(function(error){
                if(error.message){
                    utils.show('error',error.message);
                }else{
                    utils.show('error','Incorrect credentials');
                }
                done();
            });
        }
      , signout:function(){
            $http.post('/signout')
            .success(function(data){
                $cookieStore.remove('pleni.auth');
                $rootScope.flash=['success','Your account was closed ...'];
                $location.path('/signin');
            })
            .error(function(error){
                utils.show('error','Invalid request');
            });
        }
      , signup:function(email,password,csrf,captcha,reset,done){
            $http.post('/signup',{
                email:email
              , password:password
              , _csrf:csrf
              , captcha:captcha
            })
            .success(function(data){
                $rootScope.flash=['success','Your registration is complete, '
                    +'please check your email to confim your register'];
                $location.path('/signin');
                done();
            })
            .error(function(error){
                if(error.message){
                    utils.show('error',error.message);
                }else{
                    utils.show('error','Invalid request');
                }
                reset();
                done();
            });
        }
      , forgot:function(email,csrf,captcha,reset,done){
            $http.post('/forgot',{
                email:email
              , _csrf:csrf
              , captcha:captcha
            })
            .success(function(data){
                $rootScope.flash=['success','Please check your email to reset '
                    +'your password'];
                $location.path('/signin');
                done();
            })
            .error(function(error){
                if(error.message){
                    utils.show('error',error.message);
                }else{
                    utils.show('error','Invalid request');
                }
                reset();
                done();
            });
        }
    };
}]);

