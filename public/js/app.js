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
  , focus=function(element){
        $(element).focus();
    }
// Angular functions
var pleniApp=angular.module('PleniApp',['ngRoute','ngResource','ngStorage'])
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
            templateUrl:'/planners/view',
            controller:'PlannersController'
        })
        .otherwise({
            redirectTo: '/home'
        });
}])
.controller('HomeController',['$scope',function($scope){}])
.factory('Repositories',['$resource',function($resource){
    return $resource('/repositories/:repository/:action',{
        repository:'@repository'
      , action:'@action'
    },{
        update:{method:'PUT'}
      , check:{method:'POST',params:{action:'_check'}}
      , scan:{method:'POST',params:{action:'_databases'},isArray:true}
    });
}])
.controller('RepositoriesController',
    ['$scope','$sessionStorage','Repositories',
    function($scope,$sessionStorage,Repositories){
    $scope.sessionStorage=$sessionStorage;
    $scope.env={
        panel:'index'
      , type:'index'
    };
    $scope.repository={
        id:''
      , host:''
      , port:''
      , dbuser:''
      , dbpass:''
      , prefix:''
    };
    $scope.current='';

    $scope.refresh=function(){
        Repositories.query(function(data){
            for(var i=0;i<data.length;i++){
                $scope.repositories[data[i].id]={
                    host:data[i].host
                  , port:data[i].port
                  , prefix:data[i].prefix
                  , status:'unknown'
                  , databases:new Array()
                };
            }
        });
    };
    if(!$scope.sessionStorage.repositories){
        $scope.sessionStorage.repositories={};
        $scope.refresh();
    }
    $scope.repositories=$scope.sessionStorage.repositories;
    $scope.add=function(){
        $scope.prepare('new','config');
        $scope.current='';
    };
    $scope.get=function(repository){
        $scope.prepare('view','view');
        $scope.current=repository;
    };
    $scope.save=function(){
        to_waiting();
        var connection=new Repositories({
            host:$scope.repository.host
          , port:$scope.repository.port
          , dbuser:$scope.repository.dbuser
          , dbpass:$scope.repository.dbpass
          , prefix:$scope.repository.prefix
        });
        if($scope.env.panel=='new'){
            connection.id=$scope.repository.id;
            connection.$save(function(data){
                $scope.repositories[data.id]={
                    host:data.host
                  , port:data.port
                  , prefix:data.prefix
                  , status:'unknown'
                  , databases:new Array()
                };
                show_alert('success','Connection added');
                to_hide('ok','');
            },function(error){
                show_alert('danger',error.data.message);
                to_hide('fail','');
            });
        }else if($scope.env.panel=='view'){
            connection.$update({repository:$scope.current},function(data){
                $scope.repositories[$scope.current]={
                    host:data.host
                  , port:data.port
                  , prefix:data.prefix
                  , status:'unknown'
                  , databases:new Array()
                };
                show_alert('success','Connection updated');
                to_hide('ok','');
            },function(error){
                show_alert('danger',error.data.message);
                to_hide('fail','');
            });
        }
    };
    $scope.remove=function(){
        to_waiting();
        if($scope.env.panel='view'){
            Repositories.delete({repository:$scope.current},function(data){
                delete $scope.repositories[$scope.current];
                $scope.current='';
                $scope.prepare('index','index');
                show_alert('success','Connection removed');
            },function(error){
                show_alert('danger',error.data.message);
                to_hide('fail','');
            });
        }
    };
    $scope.check=function(){
        to_waiting();
        if($scope.env.type=='config'){
            var connection=new Repositories({
                host:$scope.repository.host
              , port:$scope.repository.port
              , dbuser:$scope.repository.dbuser
              , dbpass:$scope.repository.dbpass
            });
            connection.$check({},function(data){
                to_hide('ok','ok');
            },function(error){
                to_hide('fail','fail');
            });
        }else if($scope.env.type='view'){
            Repositories.check({repository:$scope.current},
            function(data){
                $scope.repositories[$scope.current].status='online';
                to_hide('ok','ok');
            },function(error){
                $scope.repositories[$scope.current].status='offline';
                to_hide('fail','fail');
            });
        }
    };
    $scope.scan=function(){
        to_waiting();
        if($scope.env.panel='view'){
            Repositories.scan({repository:$scope.current},
            function(data){
                $scope.repositories[$scope.current].status='online';
                $scope.repositories[$scope.current].databases=data;
                to_hide('ok','complete');
            },function(error){
                $scope.repositories[$scope.current].status='offline';
                to_hide('fail','fail');
            });
        }
    };
    $scope.view=function(){
        if($scope.env.type!='view'){
            $scope.prepare('view','view');
        }
    };
    $scope.edit=function(){
        if($scope.env.type!='config'){
            $scope.prepare('view','config');
            $scope.repository={
                id:$scope.current
              , host:$scope.repositories[$scope.current].host
              , port:parseInt($scope.repositories[$scope.current].port)
              , dbuser:''
              , dbpass:''
              , prefix:$scope.repositories[$scope.current].prefix
            };
        }
    };
    $scope.delete=function(){
        if($scope.env.type!='delete'){
            $scope.prepare('view','delete');
        }
    };
    $scope.prepare=function(panel,type){
        to_hide('fail','');
        hide_alert();
        $scope.env={panel:panel,type:type};
    };
}])
.factory('Planners',['$resource',function($resource){
    return $resource('/planners/:planner/:action',{
        planner:'@planner'
      , action:'@action'
    },{
        update:{method:'PUT'}
      , check:{method:'POST',params:{action:'_check'}}
      , status:{method:'POST',params:{action:'_status'}}
      , api:{method:'POST',params:{action:'_api'},isArray:true}
    });
}])
.controller('PlannersController',
    ['$scope','$sessionStorage','Planners',
    function($scope,$sessionStorage,Planners){
    $scope.sessionStorage=$sessionStorage;
    $scope.env={
        panel:'index'
      , type:'index'
    };
    $scope.planner={
        id:''
      , host:''
      , port:''
    };
    $scope.current='';

    $scope.refresh=function(){
        Planners.query(function(data){
            for(var i=0;i<data.length;i++){
                $scope.planners[data[i].id]={
                    host:data[i].host
                  , port:data[i].port
                  , status:'unknown'
                  , exclusive:false
                  , tasks:new Array()
                };
            }
        });
    };
    if(!$scope.sessionStorage.planners){
        $scope.sessionStorage.planners={};
        $scope.refresh();
    }
    $scope.planners=$scope.sessionStorage.planners;
    $scope.add=function(){
        $scope.prepare('new','config');
        $scope.current='';
    };
    $scope.get=function(planner){
        $scope.prepare('view','view');
        $scope.current=planner;
    };
    $scope.save=function(){
        to_waiting();
        var connection=new Planners({
            host:$scope.planner.host
          , port:$scope.planner.port
        });
        if($scope.env.panel=='new'){
            connection.id=$scope.planner.id;
            connection.$save(function(data){
                $scope.planners[data.id]={
                    host:data.host
                  , port:data.port
                  , status:'unknown'
                  , exclusive:false
                  , tasks:new Array()
                };
                show_alert('success','Planner added');
                to_hide('ok','');
            },function(error){
                show_alert('danger',error.data.message);
                to_hide('fail','');
            });
        }else if($scope.env.panel=='view'){
            connection.$update({planner:$scope.current},function(data){
                $scope.planners[$scope.current]={
                    host:data.host
                  , port:data.port
                  , status:'unknown'
                  , exclusive:false
                  , tasks:new Array()
                };
                show_alert('success','Connection updated');
                to_hide('ok','');
            },function(error){
                show_alert('danger',error.data.message);
                to_hide('fail','');
            });
        }
    };
    $scope.remove=function(){
        to_waiting();
        if($scope.env.panel='view'){
            Planners.delete({planner:$scope.current},function(data){
                delete $scope.planners[$scope.current];
                $scope.current='';
                $scope.prepare('index','index');
                show_alert('success','Connection removed');
            },function(error){
                show_alert('danger',error.data.message);
                to_hide('fail','');
            });
        }
    };
    $scope.check=function(){
        to_waiting();
        if($scope.env.type=='config'){
            var connection=new Planners({
                host:$scope.planner.host
              , port:$scope.planner.port
            });
            connection.$check({},function(data){
                to_hide('ok','ok');
            },function(error){
                to_hide('fail','fail');
            });
        }else if($scope.env.type='view'){
            Planners.check({planner:$scope.current},
            function(data){
                $scope.planners[$scope.current].status='online';
                to_hide('ok','ok');
            },function(error){
                $scope.planners[$scope.current].status='offline';
                to_hide('fail','fail');
            });
        }
    };
    $scope.status=function(){
        to_waiting();
        if($scope.env.type=='view'){
            Planners.status({planner:$scope.current},
            function(data){

            },function(error){

            });
        }
    };
    $scope.api=function(){
        to_waiting();
        if($scope.env.panel='view'){
            Planners.api({planner:$scope.current},
            function(data){
                $scope.planners[$scope.current].status='online';
                $scope.planners[$scope.current].tasks=data;
                to_hide('ok','complete');
            },function(error){
                $scope.planners[$scope.current].status='offline';
                to_hide('fail','fail');
            });
        }
    };
    $scope.view=function(){
        if($scope.env.type!='view'){
            $scope.prepare('view','view');
        }
    };
    $scope.edit=function(){
        if($scope.env.type!='config'){
            $scope.prepare('view','config');
            $scope.planner={
                id:$scope.current
              , host:$scope.planners[$scope.current].host
              , port:parseInt($scope.planners[$scope.current].port)
            };
        }
    };
    $scope.delete=function(){
        if($scope.env.type!='delete'){
            $scope.prepare('view','delete');
        }
    };
    $scope.prepare=function(panel,type){
        to_hide('fail','');
        hide_alert();
        $scope.env={panel:panel,type:type};
    };
}]);

