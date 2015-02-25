'use strict';

pleni.controller('MapController',
    ['$scope','$rootScope','$http','$location','Socket','Visual',
    function($scope,$rootScope,$http,$location,Socket,Visual){

    $scope.completed=0;
    $scope.total=0;
    $scope.message=$rootScope.monitor;
    $scope.waiting=true;

    $('#content').removeClass('blocked');
    var match=/pleni.url=(.+)/.exec(document.cookie)
    if(match&&match.length==2){
        $scope.url=decodeURIComponent(match[1]);
        $http.post('/mapsite').success(function(data,status){
            Visual.clean();
            if(data&&data.ok){
                Visual.render();
            }else{
                $scope.completed=data.count;
                $scope.total=data.total;
                $scope.waiting=false;
                Visual.render(data);
            }
        }).error(function(error,status){
        });
    }else{
        return $location.path('sites');
    }

    Socket.on('notifier',function(pkg){
        console.log(pkg);
        switch(pkg.action){
            case 'start':
                $scope.message=pkg.msg;
                break;
            case 'create':
                $scope.message=pkg.msg;
                break;
            case 'task':
                if(pkg.task.id=='site/fetch'){
                    if(pkg.task.msg.node){
                        Visual.add({
                            page:pkg.task.msg.node.page
                          , status:pkg.task.msg.node.status
                          , mime:pkg.task.msg.node.mime
                          , get:pkg.task.msg.node.get
                          , type:pkg.task.msg.node.type
                        },pkg.task.msg.node.rel);
                        $scope.message='GET '+pkg.task.msg.node.page+' '+
                            pkg.task.msg.node.status+'. links founded: '+
                            pkg.task.msg.node.rel.length;
                        $scope.completed++;
                        $scope.total=visual.nodes.length;
                    }else if(pkg.task.msg=='completed'){
                        $scope.waiting=false;
                        $scope.waiting='site completed';
                    }
                }
                break;
            case 'stop':
                $scope.waiting=false;
                $scope.message=pkg.msg;
                break;
        }
    });
}]);


