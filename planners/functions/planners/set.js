'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for set tasks to a planner
 * args input
 *      planner
 *          host
 *      task <-- the task for planner
 *          name
 *          count
 *          interval
 */
exports.set=function(args){
    var deferred=Q.defer()
      , url=args.planner.host+'/'
      , body={
            task:args.task.name
          , count:args.task.count
          , interval:args.task.interval
        }

    request.post({url:url,json:body},function(error,response){
        if(!error){
            if(response.statusCode==200){
                args.planner.tid=response.body.tid
                deferred.resolve(args);
                return;
            }
            deferred.reject(response.body);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

