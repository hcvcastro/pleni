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
        view:''
      , url:''
      , completed:0
      , total:0
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
            switch($scope.status.view){
                case 'search':
                    $scope.menu.settings=[1,0,0,0,1];
                    break;
                case 'sitemap':
                    $scope.menu.settings=[1,1,0,1,1];
                    break;
            }
            $state.go($scope.status.view);
        }
      , close:function(){
            pushy.togglePushy();
            $state.go('search');

            $http.delete('/').success(function(){
                $scope.menu.refresh();
            });
        }
      , more:function(){
            pushy.togglePushy();
            if($scope.status.completed==$scope.status.total){
                $scope.status.messsage=
                    'You have already completed the analysis of the site';
            }else{
                $http.put('/more').success(function(data){
                    $scope.status.waiting=true;
                    $scope.status.message=data.msg;
                }).error(function(error){
                    $scope.status.message=
                        'Waiting for the completion of previous tasks';
                });
            }
        }
      , report:function(){
            pushy.togglePushy();
            $scope.menu.settings=[1,0,0,0,1];

            $http.put('/report').success(function(data){
                $scope.status.waiting=true;
                $scope.status.message=data.msg;

                $state.go('report');
            }).error(function(error){
                    $scope.status.message=
                        'Waiting for the completion of previous tasks';
                });
        }
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

                            $state.go('sitemap');
                        });
                        $(this).remove();
                    });
                }).error(function(error){
                    switch(error.message){
                        case 'Validation error':
                            utils.show('error','The url is not a valid host');
                            break;
                        case 'Resource is busy':
                            utils.show('error',
                                'Waiting for the completion of previous tasks');
                            break;
                    }
                });
            }else{
                utils.show('error','The URL is empty');
            }
        }
    };

    $scope.sitemap={
        load:function(){
            var match=/pleni.site.url=(.+)/.exec(document.cookie)

            if(!match){
                utils.show('error','The url is not a valid host');
                $scope.status.message='You have not set a website to analyze';
                return;
            }

            $scope.status.url=decodeURIComponent(match[1]);

            $http.post('/sitemap').success(function(data){
                Visual.clean();
                if(data&&data.ok){
                    Visual.render();
                }else{
                    $scope.status.completed=data.count;
                    $scope.status.total=data.total;
                    Visual.render(data);
                }
            });
        }
    };

    $rootScope.$on('$stateChangeSuccess',function(event,toState){
        if(toState.data&&toState.data.view){
            switch(toState.data.view){
                case 'search':
                    $scope.status.view='search';
                    $scope.menu.settings=[1,0,0,0,1];
                    setTimeout(function(){
                        $('input[type=\'text\']').focus();
                    },500);
                    break;
                case 'sitemap':
                    $scope.status.view='sitemap';
                    $scope.menu.settings=[1,1,0,1,1];
                    $scope.sitemap.load();
                    break;
            }
        }
    });

    $scope.socket=io.connect('',{
        reconnect:true
      , 'forceNew':true
    });
    $scope.socket.on('notifier',function(pkg){
        if(pkg.msg){
            $scope.status.message=pkg.msg;
        }
        switch(pkg.action){
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
                        $scope.status.message='GET '+pkg.task.msg.node.page+' '
                            +pkg.task.msg.node.status+'. links found: '
                            +pkg.task.msg.node.rel.length;
                        $scope.status.completed++;
                        $scope.status.total=visual.nodes.length;
                    }else if(pkg.task.msg=='completed'){
                        $scope.status.waiting=false;
                    }
                }
                break;
            case 'stop':
                $scope.status.waiting=false;
                break;
        }
        $scope.$apply();
    });
}]);

