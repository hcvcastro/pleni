'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for get the api from planner
 * args input
 *      planner
 *          host
 *
 * args output
 *      planner
 *          tasks
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.planner.host+'/_api'

    request.get({url:url},function(error,response){
        if(!error){
            if(response.statusCode==200){
                args.planner.tasks=JSON.parse(response.body);
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

