Date.prototype.print=function(){
    var pad=function(number){
        if(number<10){
            return '0'+number;
        }
        return number;
    };
    return this.getFullYear()+'-'+
           pad(this.getMonth())+'-'+
           pad(this.getDate())+' '+
           pad(this.getHours())+':'+
           pad(this.getMinutes())+':'+
           pad(this.getSeconds());
}

$(function(){
    var socket=io()
      , expand=function(){
            if($(this).find('div.expand').text()=='⏵'){
                $(this).find('div.expand').text('⏷');
                $(this).find('div.details').css('display','block');
            }else{
                $(this).find('div.expand').text('⏵');
                $(this).find('div.details').css('display','none');
            }
        }

    socket.on('notifier',function(msg){
        var message=$('<div class="event">'
            +'<div class="expand">⏷</div>'
            +'<div class="date">'+new Date().print()+'</div>'
            +'<div class="action">'+msg.action+'</div>'
            +'<div class="details"><table>'
                +$(JsonHuman.format(msg)).html()+'</table></div>'
            +'<div class="clearfix"></div>'
            +'</div>');

        message.click(expand);
        $('#content').append(message);
        $(document).scrollTop($(document).height());
    });
});

