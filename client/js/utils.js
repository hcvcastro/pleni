'use strict';

var utils={
    show:function(type,message){
        var message='<div class="'+type+'"><div class="close">'
            +'<a onclick=\'utils.hide(this)\' class="fa fa-close"></a>'
            +'</div><p>'+message+'</p></div>';
        $('.messages').append(message);
    }
  , hide:function(element){
        $(element).parent().parent().slideUp('slow',
            function(){$(this).remove();});
    }
  , clean:function(){
        $('.messages').empty();
    }
  , send:function(message){
        $('p.offset>.message').html(message);
        $('p.offset>.hide').removeClass('hide');
    }
  , receive:function(){
        $('p.offset>span').addClass('hide');
    }

  , set_list:function($scope){
        $scope.dbservers.env.view='list';
        $scope.repositories.env.view='list';
        $scope.planners.env.view='list';
        $scope.notifiers.env.view='list';
    }
  , set_active:function(element,index){
        $('section.'+element).addClass('active')
            .siblings().removeClass('active');
        $('nav.menu>ul>li:nth-child('+index+')').addClass('active')
            .siblings().removeClass('active');
    }

  , load_resources_start:function(index,hide){
        $('.menu>ul.items>li:nth-child('+index+')>div.right>a')
            .addClass('fa-spin')
        if(hide){
            $('article.list table').fadeOut();
        }
    }
  , load_resources_end:function(index,hide){
        $('.menu>ul.items>li:nth-child('+index+')>div.right>a')
            .removeClass('fa-spin')
        if(hide){
            $('article.list table').fadeIn();
        }
    }
};

