'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('validator')

/*
 * Function for set tasks to a planner
 * args input
 *      auth (*)
 *          cookie
 *          ts
 *      planner
 *          host
 *          tid <-- optional for override
 *      task <-- the task for planner
 *          name
 *          count
 *          interval
 *
 * args output
 *      planner
 *          tid
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.planner.host+'/'
      , headers={}
      , body={
            task:args.task.name
          , count:args.task.count
          , interval:args.task.interval
        }

    if(args.debug){
        console.log('post request for setting task ... '+args.planner.host);
    }

    if(args.planner.tid){
        body.tid=args.planner.tid;
    }

    if(args.auth&&args.auth.cookie){
        headers['Cookie']=args.auth.cookie;
    }

    request.post({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(response.statusCode==200){
                args.planner.tid=response.body.tid;
                deferred.resolve(args);
            }else{
                deferred.reject({error:'not override'});
            }
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

