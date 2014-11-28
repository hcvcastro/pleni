'use strict';

var utils={
    show:function(type,message){
        var message='<div class="'+type+'"><div class="close">'
            +'<a onclick=\'utils.hide(this)\' class="fa fa-close"></a>'
            +'</div><p>'+message+'</p></div>';
        $('section.messages').append(message);
    }
  , hide:function(element){
        $(element).parent().parent().slideUp('slow',
            function(){$(this).remove();});
    }
  , clean:function(){
        $('section.messages').empty();
    }
  , send:function(message){
        $('p.offset>.message').html(message);
        $('p.offset>.hide').removeClass('hide');
    }
  , receive:function(){
        $('p.offset>span').addClass('hide');
    }
};

