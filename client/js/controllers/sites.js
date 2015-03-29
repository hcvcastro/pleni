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
    ['$scope','$rootScope','$state','$http','$window','$location','Visual',
    function($scope,$rootScope,$state,$http,$window,$location,Visual){

    $scope.$state=$state;
    $scope.status={
        url:''
      , completed:''
      , total:''
      , message:''
      , waiting:false
    };

    $scope.menu={
        settings:[1,0,0,0,1]
      , show:function(index){
            return $scope.menu.settings[index];
        }
      , open:function(){
            pushy.togglePushy();
        }
      , hide:function(){
            pushy.togglePushy();
        }
      , refresh:function(){
            $window.location.reload();
        }
      , about:function(){
            pushy.togglePushy();
            $scope.menu.settings=[1,0,0,0,1];
            $state.go('about');
        }
      , home:function(){
            $scope.menu.settings=[1,0,0,0,1];
            $state.go('search');
        }

/*
        $scope.close=function(pushy){
            if(!pushy){
                pushy.togglePushy();
            }
            $http.delete('/').success(function(){
                $location.path('sites');
                $window.location.reload();
            });
        };

        $scope.report=function(){
            pushy.togglePushy();
            $location.path('report');
        }

        $scope.more=function(){
            pushy.togglePushy();
            $http.put('/more').success(function(data){
                $rootScope.monitor=data.msg+' ';
                if(data.queue==0){
                    $rootScope.monitor+='. starting ...';
                }else{
                    $rootScope.monitor+='(aprox:'+data.queue+' minutes)';
                }

                $location.path('/map');
            });
        }
*/
    };

    $scope.search={
        url:''
      , send:function(){
            utils.clean();
            if($scope.search.url!=''){
                $scope.status.message='Sending a request for fetch';

                $http.put('/sites',{
                    site:$scope.search.url
                  , agent:navigator.userAgent
                }).success(function(data){
                    $('footer').fadeOut('slow',function(){
                        $('.main').fadeOut('slow',function(){
                            $('#content').removeClass('blocked');
                            $(this).remove();

                            $scope.status.waiting=true;
                            $scope.status.message=data.msg;
                            if(data.queue!=0){
                                $scope.status.message+=' (waiting for :'
                                    +data.queue+' tasks)';
                            }

                            $scope.menu.settings=[1,1,1,1,1];
                            $state.go('sitemap');
//                            $scope.sitemap.load(false);
                        });
                        $(this).remove();
                    });
                }).error(function(error){
                    utils.show('error','The url is not a valid host');
                });
            }else{
                utils.show('error','The URL is empty');
            }
        }
    };

    $scope.sitemap={
        load:function(flag){
            var match=/pleni.url=(.+)/.exec(document.cookie)
            $scope.status.url=decodeURIComponent(match[1]);

            if(flag){
/*                $http.post('/mapsite').success(function(data){
                    Visual.clean();
                    if(data&&data.ok){
                        Visual.render();
                    }else{
                        $scope.completed=data.count;
                        $scope.total=data.total;
                        $scope.waiting=false;
                        Visual.render(data);
                    }
                });*/
            }else{
/*                Visual.clean();
                Visual.render();*/
            }
        }
    };

    $rootScope.$on('$stateChangeStart',function(event,toState){
        if(toState.data&&toState.data.view){
            switch(toState.data.view){
                case 'search':
                    $('input[type=\'text\']').focus();
                    break;
                case 'sitemap':
                    break;
            }
        }
    });

    $scope.socket=io.connect('',{
        reconnect:true
      , 'forceNew':true
    });
    $scope.socket.on('notifier',function(pkg){
        console.log(pkg);
/*        switch(pkg.action){
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
        $scope.$apply();*/
    });
}]);

