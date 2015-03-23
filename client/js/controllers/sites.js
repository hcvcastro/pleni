'use strict';

var utils={
    show:function(type,message){
        var message='<div class="message '+type+'"><div class="close">'
            +'<a onclick=\'utils.hide(this)\' class="fa fa-close"></a>'
            +'</div><p>'+message+'</p></div>';
        $('.messages').append(message).show('slow');
    }
  , hide:function(element){
        $(element).parent().parent().slideUp('slow',
            function(){$(this).remove();});
    }
  , clean:function(){
        $('.messages').hide('fast').empty();
    }
};

pleni.controller('SitesController',
    ['$scope','$rootScope','$http','$location',
    function($scope,$rootScope,$http,$location){

    $scope.status={
        url:''
      , completed:''
      , total:''
      , message:''
      , waiting:false
    };

    $scope.menu={
        open:function(){
            pushy.togglePushy();
        }
      , close:function(){
            pushy.tooglePushy();
        }
    };

    $scope.socket=io.connect('',{
        reconnect:true
      , 'forceNew':true
    });
    $scope.socket.on('notifier',function(pkg){
        console.log(pkg);
    });
}]);

