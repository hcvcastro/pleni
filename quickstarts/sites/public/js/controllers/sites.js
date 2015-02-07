'use strict';

pleni.controller('SitesController',
    ['$scope','$sessionStorage','$http','Socket','Visual',
    function($scope,$sessionStorage,$http,Socket,Visual){
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
                    $('#content').empty().append('<div id="canvas"></div>');
                });
            }).error(function(error){
                utils.show('error','The url is not a valid host');
            });
        }
    }

    Socket.on('notifier',function(pkg){
        switch(pkg.action){
            case 'ready':
                Visual.render();
                break;
            case 'task':
                if(pkg.task.id=='site/fetch'){
                    if(pkg.task.msg.node){
                        Visual.add({
                            page:pkg.task.msg.node.page
                          , status:pkg.task.msg.node.status
                          , mime:pkg.task.msg.node.mime
                          , get:pkg.task.msg.node.get
                          , tpye:pkg.task.msg.node.type
                        },pkg.task.msg.node.rel);
                    }else if(pkg.task.msg=='completed'){
                        
                    }
                }
                break;
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

