'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for remove a task from planner
 * args definition
 *      planner
 *          host
 *          tid <-- task id
 */
exports.remove=function(args){
    var deferred=Q.defer()
      , url=args.planner.host+'/'+args.planner.tid

    request.del({url:url},function(error,response){
        if(!error){
            if(response.statusCode==200){
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

