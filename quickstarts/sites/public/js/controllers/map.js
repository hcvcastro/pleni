'use strict';

pleni.controller('MapController',
    ['$scope','$http','$location','Socket','Visual',
    function($scope,$http,$location,Socket,Visual){
    
    $('#content').removeClass('blocked');
    var match=/pleni.url=(.+)/.exec(document.cookie)
    if(match&&match.length==2){
        $scope.url=decodeURIComponent(match[1]);
        if($scope.url.indexOf('~')!=0){
            $http.post('/mapsite').success(function(data,status){
                Visual.clean();
                Visual.render(data);
            }).error(function(error,status){});
        }
    }else{
        return $location.path('sites');
    }

    $scope.completed=0;
    $scope.total=0;
    $scope.message='';
    $scope.waiting=false;

    $scope.menu=function(){
        pushy.togglePushy();
    }

    Socket.on('notifier',function(pkg){
        console.log(pkg);
        switch(pkg.action){
            case 'create':
                Visual.clean();
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


