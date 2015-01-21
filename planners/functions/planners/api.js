'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('validator')

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

    if(args.debug){
        console.log('request for api ... '+args.planner.host);
    }
    request.get({url:url},function(error,response){
        if(!error){
            if(validator.isJSON(response.body)){
                if(response.statusCode==200){
                    args.planner.tasks=JSON.parse(response.body);
                    deferred.resolve(args);
                }else{
                    deferred.reject(response.body);
                }
            }else{
                deferred.reject({error:'response_malformed'});
            }
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

