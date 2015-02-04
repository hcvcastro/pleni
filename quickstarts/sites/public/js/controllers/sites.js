'use strict';

pleni.controller('SitesController',
    ['$scope','$sessionStorage','$http','Socket',
    function($scope,$sessionStorage,$http,Socket){
        $scope.storage=$sessionStorage;
        $scope.thread=undefined;

        $scope.message='';

    $('input[type=\'text\']').focus();

    $scope.url='';
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
            }).error(function(error){
                utils.show('error','The url is not a valid host');
            });
        }
    }

    Socket.on('notifier',function(pkg){
        switch(pkg.action){
            default:
                console.log(pkg);
        }
    });

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

