'use strict';
// jQuery functions
var show_alert=function(type,message){
        $('.message').html(message)
        .parent().removeClass('hide')
                 .removeClass('alert-success alert-danger')
                 .addClass('alert-'+type);
    }
  , hide_alert=function(){
        $('div.alert').addClass('hide')
    }
  , to_waiting=function(){
        $('#test>span.loader').removeClass('hide');
        $('#test>span.result').removeClass('hide').html('');
    }
  , to_hide=function(mes1,mes2){
        $('#test>span.loader').addClass('hide');
        $('#test>span.result').removeClass('ok fail')
                              .addClass(mes1).html(mes2);
    }

// Angular functions
var pleniApp=angular.module('PleniApp',['ngRoute','ngResource'])
.config(['$routeProvider',function($routeProvider){
    $routeProvider
        .when('/home',{
            templateUrl:'/home',
            controller:'HomeController'
        })
        .when('/repositories',{
            templateUrl:'/repositories/view',
            controller:'RepositoriesController'
        })
        .when('/planners',{
            templateUrl:'/planners',
            controller:'PlannersController'
        })
        .otherwise({
            redirectTo: '/home'
        });
}])
.factory('Repositories',['$resource',function($resource){
    return $resource('/repositories/:repository',{
        repository:'@repository'
    },{
    }
    );
}])
.controller('HomeController',['$scope',function($scope){}])
.controller('RepositoriesController',
    ['$scope','$http','Repositories',function($scope,$http,Repositories){
    $scope.panel='';
    $scope.type='';
    $scope.repositories=Repositories.query();
    $scope.id='';
    $scope.host='';
    $scope.dbuser='';
    $scope.dbpass='';
    $scope.prefix='';

    $scope.add=function(){
        $scope.clean();
        $scope.panel='config';
        $scope.title='Add connection';
        $scope.type='add';
    };
    $scope.get=function(repository){
        $scope.clean();
        $scope.panel='view';
        $scope.type='get';
        Repositories.get({repository:repository},function(repository){
            $scope.title='Repository: '+repository.id;
            $scope.id=repository.id;
            $scope.host=repository.host;
            $scope.port=parseInt(repository.port);
            $scope.prefix=repository.prefix;
        });
    };
    $scope.save=function(){
        to_waiting();
        if($scope.type=='add'){
            var connection=new Repositories();
            connection.id=$scope.id;
            connection.host=$scope.host;
            connection.port=$scope.port;
            connection.dbuser=$scope.dbuser;
            connection.dbpass=$scope.dbpass;
            connection.prefix=$scope.prefix;
            connection.$save(function(data){
                $scope.repositories=Repositories.query();
                show_alert('success','Connection added');
                to_hide('ok','ok');
            },function(error){
                show_alert('danger',error.data.message);
                to_hide('fail','fail');
            });
        }else if($scope.type=='get'){
            
        }
    };
    $scope.check=function(){
        to_waiting();
        if($scope.type=='add'){
            $http
            .post('/repositories/_check',{
                host:$scope.host
              , port:$scope.port
              , dbuser:$scope.dbuser
              , dbpass:$scope.dbpass
            })
            .success(function(data){
                to_hide('ok','ok');
            })
            .error(function(data){
                to_hide('fail','fail');
            });
        }else if($scope.type='get'){
            $http
            .post('/repositories/'+$scope.id+'/_check',{})
            .success(function(data){
                to_hide('ok','ok');
            })
            .error(function(data){
                to_hide('fail','fail');
            });
        }
    };
    $scope.scan=function(){
        if($scope.type='get'){

        }
    };
    $scope.clean=function(){
        to_hide('fail','');
        hide_alert();
    };
}])
.controller('PlannersController',
    ['$scope','$http',function($scope,$http){
}]);

/*

    $scope.testdb=function(){
        $http.post('/settings/testdb',{host:$scope.host,port:$scope.port})
            .success(function(data){
                if(data.result){
                }else{
                    hideWaiting('fail',data.message);
                }
            })
            .error(function(){
                hideWaiting('fail','Error');
            });
    };

    $scope.savedb=function(){
        showWaiting();
        $http.post('/settings/savedb',
            {host:$scope.host,port:$scope.port,prefix:$scope.prefix})
            .success(function(data){
                hideWaiting('ok','');
                if(data.result){
                    showAlert('success',data.message);
                }else{
                    showAlert('danger',data.message);
                }
            })
            .error(function(){
                hideWaiting('fail','');
                showAlert('danger','Connection error');
            });

    };



    $scope.showindex=function(){$scope.panel='index';};
    $scope.showcreate=function(){$scope.panel='create';};

    $scope.createrepo=function(){
        $http.post('/repositories',
            {repository:$scope.repository})
            .success(function(data){
                console.log('created');
            });
    };
*/
