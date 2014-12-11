Date.prototype.print=function(){
    return this.getFullYear()+'-'+
           this.getMonth()+'-'+
           this.getDate()+' '+
           this.getHours()+':'+
           this.getMinutes()+':'+
           this.getSeconds();
}

$(function(){
    var socket=io()

    socket.on('notifier',function(msg){
        var message='<p><strong>'+new Date().print()+':</strong> '+msg.action;
        if(msg.name){
            message+=' '+msg.name;
        }
        if(msg.params){
            message+=' '+JSON.stringify(msg.params);
        }
        message+='</p>';
        $('body>section').append(message);
    });
});

