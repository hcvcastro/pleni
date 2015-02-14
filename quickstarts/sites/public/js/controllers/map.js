'use strict';

pleni.controller('MapController',['$scope','$http','Socket','Visual',
    function($scope,$http,Socket,Visual){
    
    $('#content').removeClass('blocked');
}]);


/*
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
        }*/

