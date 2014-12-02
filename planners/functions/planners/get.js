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
 *          tid
 *
 * args output
 *      planner
 *      task
 *          name
 *          count
 *          interval
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.planner.host+'/'+args.planner.tid

    if(args.debug){
        console.log('get a task for planner ... '+args.planner.host);
    }
    request.get({url:url},function(error,response){
        if(!error){
            if(validator.isJSON(response.body)){
                var parse=JSON.parse(response.body);

                if(response.statusCode==200){
                    args.planner.task={
                        name:parse.task
                      , count:parse.count
                      , interval:parse.interval
                    };
                    deferred.resolve(args);
                    return;
                }
                deferred.reject(parse);
                return;
            }
            deferred.reject({error:'response_malformed'});
            return;
        }
        deferred.reject(error);
        return;
    });

    return deferred.promise;
};

