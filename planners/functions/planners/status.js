'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('validator')

/*
 * Function for getting status from planner
 * args input
 *      planner
 *          host
 *
 * args output
 *      planner
 *          status
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.planner.host+'/_status'

    if(args.debug){
        console.log('request for status ... '+args.planner.host);
    }
    request.get({url:url},function(error,response){
        if(!error){
            if(validator.isJSON(response.body)){
                if(response.statusCode==200){
                    args.planner.status=(JSON.parse(response.body)).status;
                    deferred.resolve(args);
                    return;
                }
                deferred.reject(response.body);
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

