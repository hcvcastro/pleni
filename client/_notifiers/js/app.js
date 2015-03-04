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
    var socket=io();

    socket.on('notifier',function(msg){
        var message='<p><strong>'+new Date().print()+':</strong> ';
        message+=JSON.stringify(msg);
        message+='</p>';
        $('body>section').append(message);
        $(document).scrollTop($(document).height());
    });
});

