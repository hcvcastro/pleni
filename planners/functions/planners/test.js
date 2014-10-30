'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for testing of planners
 * args input
 *      planner
 *          host
 */
exports.test=function(args){
    var deferred=Q.defer()
      , url=args.planner.host

    request.get({url:url},function(error,response){
        if(!error){
            if(response.statusCode==200){
                if(JSON.parse(response.body).planner){
                    deferred.resolve(args);
                    return;
                }
            }
            deferred.reject(JSON.parse(response.body));
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

