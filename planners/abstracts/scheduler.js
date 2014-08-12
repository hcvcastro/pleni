'use strict';

var scheduler=function(task,count,interval){
    this._status='stopped';

    if(count==Number.POSITIVE_INFINITY){
        this._infinite=true;
        this.count=0;
    }else{
        this._infinite=false;
        this.count=count;
    }

    this._interval=interval||1000;
    this.task=task;

    this._timeout;

    this.status=function(){
        return {status:this._status};
    };

    this.run=function(){
        if(this._timeout==undefined){
            this.schedule();
            this._status='running';
        }
        return this.status();
    };

    this.stop=function(){
        if(this._timeout!=undefined){
            clearTimeout(this._timeout);
            this._timeout=undefined;
            this._status='stopped';
        }

        return this.status();
    };

    this.schedule=function(){
        var self=this;
        this._timeout=setTimeout(function(){
            if(self._infinite||self.count>0){
                self.count--;
                self.task(
                    function(){self.schedule();},
                    function(){self.stop();}
                );
            }else{
                self.stop();
            }
        },this._interval);
    };

    this.settask=function(){
        return {ok:true};
    };
    this.gettask=function(){
        return {ok:true};
    };
    this.removetask=function(){
        return {ok:true};
    };
};

module.exports=scheduler;

