'use strict';

var server=require('./server')
  , validate=require('../utils/validators')
  , _success=require('../utils/json-response').success
  , _error=require('../utils/json-response').error
  , generator=require('../functions/utils/random').sync

var planner=function(notifier){
    this.valid_tasks=[
        'exclusive'
      , 'site/create'
      , 'site/fetch'
      , 'site/remove'
      , 'site/summarize'
    ];

    this.tid;
    this.name;
    this.action;

    this.api=function(request,response){
        var map=this.valid_tasks.map(function(element){
            return require('../tasks/'+element).schema;
        })

        response.status(200).json(map);
    }

    this.create=function(request,response){
        if(this.tid===undefined){
            if(validate.validSlugSlash(request.body.task)){
                var name=validate.toString(request.body.task)
                  , count=validate.toInt(request.body.count)
                  , interval=validate.toInt(request.body.interval)
                  , valid_task=this.valid_tasks.some(function(element){
                        return element===name})

                if(valid_task){
                    this.tid=generator().toString();
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

                    notifier.create(this.name,count,interval,this.tid);
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
            notifier.remove(this.name);

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

            var schema=require('../tasks/'+this.name).schema
              , jayschema=require('jayschema')
              , js=new jayschema()

            if(js.validate(request.body,schema)){
                this.action=request.body;
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
        require('../tasks/'+this.name)(this.action,repeat,stop);
    };
};

module.exports=planner;
module.exports.server=server;

