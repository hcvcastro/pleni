'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('validator')

/*
 * Function for set tasks to a planner
 * args input
 *      planner
 *          host
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
      , body={
            task:args.task.name
          , count:args.task.count
          , interval:args.task.interval
        }

    if(args.debug){
        console.log('post request for setting task ... '+args.planner.host);
    }
    request.post({url:url,json:body},function(error,response){
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

