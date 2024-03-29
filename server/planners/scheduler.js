'use strict';

var queue=require('async').queue

module.exports=function(notifier,task,count,interval){
    this._status='stopped';
    this._timeout;
    this.task=task;

    this.count=function(count){
        if(count!=undefined){
            if(count==-1){
                this._infinite=true;
                this._count=-1;
            }else{
                this._infinite=false;
                this._count=parseInt(count);
            }
        }
    };
    this.count(count);

    this.interval=function(interval){
        if(interval==undefined){
            interval=1000;
        }
        this._interval=interval;
    };
    this.interval(interval);

    this.status=function(request,response){
        response.status(200).json({status:this._status});
    };

    this.run=function(request,response){
        this._run();
        this.status(request,response);
    };

    this.stop=function(request,response){
        this._stop();
        this.status(request,response);
    };

    this._schedule=function(){
        var self=this;
        this._timeout=setTimeout(function(){
            if(self._infinite||self._count>0){
                if(!self._infinite){
                    self._count--;
                }
                self.task(
                    function(){self._schedule();},
                    function(){self._stop();}
                );
            }else{
                self._stop();
            }
        },this._interval);
    };
    this._run=function(){
        if(!this._timeout){
            this._schedule();
            this._status='running';
            if(notifier){
                notifier({
                    action:'run'
                });
            }
        }
    };
    this._stop=function(){
        if(this._timeout){
            clearTimeout(this._timeout);
            delete this._timeout;
            this._status='stopped'
            if(notifier){
                notifier({
                    action:'stop'
                });
            }
        }
    };
};

