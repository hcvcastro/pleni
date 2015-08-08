'use strict';

var utils={
    lpad:function(number,pad){
        return (pad+number).slice(-1*pad.length);
    }
  , prettydate:function(ts){
        var date=new Date(ts)
        return [date.getFullYear(),
            this.lpad(((+date.getMonth())+1),'00'),
            this.lpad(date.getDate(),'00')].join('-')+' '+[
            this.lpad(date.getHours(),'00'),
            this.lpad(date.getMinutes(),'00'),
            this.lpad(date.getSeconds(),'00')].join(':');
    }
  , show:function(type,message){
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
        $('p.load>.message').html(message);
        $('p.load>.hide').removeClass('hide');
    }
  , receive:function(){
        $('p.load>span').addClass('hide');
    }

  , set_list:function($scope){
        if($scope.dbservers){
            $scope.dbservers.env.view='list';
        }
        if($scope.repositories){
            $scope.repositories.env.view='list';
        }
        if($scope.planners){
            $scope.planners.env.view='list';
        }
        if($scope.notifiers){
            $scope.notifiers.env.view='list';
        }
    }
  , set_active:function(element,index){
        $('section.'+element).addClass('active')
            .siblings().removeClass('active');
        $('nav.menu>ul>li:nth-child('+index+')').addClass('active')
            .siblings().removeClass('active');
    }
  , set_header:function(grid){
        if($('header>nav').hasClass('grid')){
            if(!grid){
                $('header>nav').removeClass('grid');
            }
        }else{
            if(grid){
                $('header>nav').addClass('grid');
            }
        }
    }
  , set_tab:function(i,j){
        switch(i){
            case 0:
                $('header>nav>ul:nth-child(2)>li').removeClass('active');
                $('header>nav>ul:nth-child(1)>li:nth-child('+j+')')
                    .addClass('active').siblings().removeClass('active');
                break;
            case 1:
                $('header>nav>ul:nth-child(1)>li').removeClass('active');
                $('header>nav>ul:nth-child(2)>li:nth-child('+j+')')
                    .addClass('active').siblings().removeClass('active');
                break;
        }
    }

  , load_resources_start:function(index,hide){
        $('.menu>ul.items>li:nth-child('+index+')>.title>div.right>a')
            .addClass('fa-spin')
        if(hide){
            $('article.list table').fadeOut();
        }
    }
  , load_resources_end:function(index,hide){
        $('.menu>ul.items>li:nth-child('+index+')>.title>div.right>a')
            .removeClass('fa-spin')
        if(hide){
            $('article.list table').fadeIn();
        }
    }
  , load_projects_start:function(){
        $('article.list table').fadeOut();
    }
  , load_projects_end:function(){
        $('article.list table').fadeIn();
    }
};

