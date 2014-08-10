'use strict';

module.exports=function(task,times,delay){
    var timer=delay
      , counter=0
      , infinite=false

    if(times == Number.POSITIVE_INFINITY){
        infinite=true;
    }else if(times>0){
        counter=times;
    }

    return {
        run:function(){
            //console.log('running: '+counter);
            this.id=setInterval(function(){
                if(infinite||counter>0){
                    task()
                    counter--
                }else{
                    clearInterval(this.id);
                }
            },timer);
        }
      , stop:function(){
            if(typeof this.id=='object'){
                //console.log('stopping');
                clearInterval(this.id);
            }
        }
      , status:function(){
            //console.log('getting current status');
        }
    };
}

