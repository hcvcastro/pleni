'use strict';

pleni.controller('SitesController',
    ['$scope','$rootScope','$http','$location',
    function($scope,$rootScope,$http,$location){

    $scope.message='';
    $scope.url='';

    $('input[type=\'text\']').focus();

    $scope.send=function(){
        utils.clean();
        if($scope.url!=''){
            $http.put('/sites',{
                site:$scope.url
              , agent:navigator.userAgent
            }).success(function(data){
                $('footer').fadeOut('slow',function(){
                    $('.main').fadeOut('slow',function(){
                        $('#content').removeClass('blocked');
                        $(this).remove();
                    });
                    $(this).remove();
                });

                $rootScope.monitor=data.msg+' ';
                if(data.queue==0){
                    $rootScope.monitor+='. starting ...';
                }else{
                    $rootScope.monitor+='(aprox:'+data.queue+' minutes)';
                }

                $location.path('/map');
            }).error(function(error){
                utils.show('error','The url is not a valid host');
            });
        }else{
            utils.show('error','The url is empty');
        }
    }
}]);

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
