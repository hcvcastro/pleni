'use strict';

var server=require('./abstracts/server')
  , scheduler=require('./abstracts/scheduler')
  , validate=require('./utils/validators')
  , _success=require('./utils/json-response').success
  , _error=require('./utils/json-response').error
  , f=require('./functions/random')

var planner=function(){
    this.valid_tasks=[
        'exclusive'
      , 'site_creator'
      , 'site_fetcher'
    ];

    this.tid;
    this.name;
    this.action;

    this.api=function(request,response){
        var map=this.valid_tasks.map(function(element){
            return {
                name:element
              , args:require('./tasks/'+element).args
            };
        })

        response.status(200).json(map);
    }

    this.create=function(request,response){
        if(this.tid===undefined){
            if(validate.validSlug(request.body.task)){
                var name=validate.toString(request.body.task)
                  , count=validate.toInt(request.body.count)
                  , interval=validate.toInt(request.body.interval)
                  , valid_task=this.valid_tasks.some(function(element){
                        return element===name})

                if(valid_task){
                    this.tid=f.generatorid({})['random'];
                    this.name=name;

                    if(isNaN(count)){
                        count=1
                    }
                    if(count<0){
                        count=Number.POSITIVE_INFINITY;
                    }
                    this.count(count);

                    if(isNaN(interval)||interval<0){
                        interval=1000
                    }
                    this.interval(interval);

                    console.log('PUT TASK:'+this.name
                        +'('+count+')('+interval+') --> '+this.tid);
                    response.status(200).json({ok:true,tid:this.tid});
                    return;
                }

                response.status(403).json(_error.notfound);
                return;
            }

            response.status(403).json(_error.validation);
            return;
        }

        response.status(403).json(_error.notoverride);
        return;
    };

    this.remove=function(request,response){
        if(this.tid!==undefined&&this.tid===request.params.tid){
            this._stop();
            console.log('DEL TASK:'+this.name);

            this.tid=undefined;
            this.name=undefined;

            response.status(200).json(_success.ok);
            return;
        }

        response.status(404).json(_error.notfound);
    };

    this.get=function(request,response){
        if(this.tid!==undefined&&this.tid===request.params.tid){
            response.status(200).json({
                task:this.name
              , count:this._count
              , interval:this._interval
            });
            return;
        }

        response.status(404).json(_error.notfound);
    };

    this.run=function(request,response){
        if(this.tid!==undefined
            &&this.name!==undefined
            &&this.tid===request.params.tid){

            this.action=require('./tasks/'+this.name).cleanargs(request.body)
            if(this.action!==undefined){
                this._run();
                this.status(request,response);
            }else{
                this._stop();
                response.status(403).json(_error.validation);
            }
            return;
        }

        response.status(404).json(_error.notfound);
    };

    this.stop=function(request,response){
        if(this.tid!==undefined&&this.tid===request.params.tid){
            this._stop();
            this.status(request,response);
            return;
        }
        
        response.status(404).json(_error.notfound);
    };

    this.task=function(repeat,stop){
        require('./tasks/'+this.name)(this.action,repeat,stop);
    };
};

planner.prototype=new scheduler();

server.set(process.env.PORT);
server.listen(new planner());
server.run();

module.exports=planner;
module.exports.app=server.app;

