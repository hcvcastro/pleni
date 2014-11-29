'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('validator')

/*
 * Function for testing of planners
 * args input
 *      planner
 *          host
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.planner.host

    if(args.debug){
        console.log('testing planner server ... '+args.planner.host);
    }
    request.get({url:url},function(error,response){
        if(!error){
            if(validator.isJSON(response.body)){
                if(response.statusCode==200){
                    if(JSON.parse(response.body).planner){
                        deferred.resolve(args);
                        return;
                    }
                }
                deferred.reject(JSON.parse(response.body));
                return;
            }
            deferred.reject({error:'response_malformed'});
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

