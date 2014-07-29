'use strict';

var controllers=angular.module('PleniControllers',[]);

controllers.controller('HomeController',['$scope',function($scope){}]);

controllers.controller('SettingsController',['$scope',function($scope){
    $scope.testdb=function(){
        console.log('testing the couchdb settings');
        $('#test>span.loader').removeClass('hide');
        $('#test>span.result').addClass('ok').html('OK');
    };
}]);

controllers.controller('FetchController',['$scope',function($scope){}]);

