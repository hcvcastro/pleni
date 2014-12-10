$(function(){
    var socket=io()

    socket.on('notifier',function(msg){
        var message='<p><strong>'+new Date().toString()+': '+msg.action;
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

