'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for getting status from planner
 * args input
 *      planner
 *          host
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.planner.host+'/_status'

    request.get({url:url},function(error,response){
        if(!error){
            if(response.statusCode==200){
                args.planner.status=(JSON.parse(response.body)).status;
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

