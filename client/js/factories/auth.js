'use strict';

pleni.factory('Auth',['$http','$cookieStore','$location',
    function($http,$cookieStore,$location){
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
                utils.show('success','Redirecting to projects list ...');
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

