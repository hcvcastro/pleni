'use strict';

pleni.controller('SitesController',['$scope','$http','$location',
    function($scope,$http,$location){

    $scope.message='';
    $scope.url='';

    $('input[type=\'text\']').focus();

    $scope.send=function(){
        utils.clean();
        if($scope.url!=''){
            $http.put('/sites',{site:$scope.url}).success(function(data){
                $('footer').fadeOut('slow',function(){
                    $('.main').fadeOut('slow',function(){
                        $('#content').removeClass('blocked');
                        $(this).remove();
                    });
                    $(this).remove();
                });
                return $location.path('map');
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

