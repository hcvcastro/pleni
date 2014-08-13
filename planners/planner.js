'use strict';

var server=require('./abstracts/server')
  , scheduler=require('./abstracts/scheduler')
  , f=require('./functions/random')

var planner=function(){
    this.valid_tasks=[
        'clock'
      , 'site_creator'
      , 'site_fetcher'
    ];

    this.tid;
    this.name;
    this.action;

    this.settask=function(name,query,action,response){
        if(this.tid===undefined){
            if(this.valid_tasks.some(function(element){return element===name})){
                this.tid=f.generatorid({})['random'];
                this.name=name;
                this.action=action;
                var count=1;

                if(query['count']!=undefined){
                    var _count=parseInt(query['count']);
                    if(_count<0){
                        _count=Number.POSITIVE_INFINITY;
                    }
                    count=_count;
                }
                this.setcount(count);

                if(query['delay']!=undefined){
                    var _delay=parseInt(query['delay']);
                    if(_delay<0){
                        _delay=1000;
                    }
                    this.interval=_delay;
                }

                console.log('new task: '+this.name);
                console.log('count: '+count);
                console.log('delay: '+this.interval);
                console.log(action);
                return {ok:true,tid:this.tid};
            }
            response.status(403);
            return {ok:false,message:'task no recognized'};
        }
        response.status(403);
        return {ok:false};
    };

    this.gettask=function(tid,response){
        if(this.tid===tid){
            return {ok:true,task:this.name};
        }else{
            response.status(404);
            return {ok:false};
        }
    };

    this.removetask=function(tid,response){
        if(this.tid===tid){
            this.tid=undefined;
            this.name=undefined;
            this.action=undefined;
            return {ok:true};
        }else{
            response.status(404);
            return {ok:false};
        }
    };

    this.task=function(repeat,stop){
        if(this.name!=undefined){
            var func=require('./tasks/'+this.name);
            if(func.valid(this.action)){
                func(this.action,repeat,stop);
            }else{
                console.log('bad package');
                stop();
            }
        }
    };
};

planner.prototype=new scheduler();

server.set(3001);
server.listen(new planner());
server.run();

module.exports=planner;
module.exports.app=server.app;

