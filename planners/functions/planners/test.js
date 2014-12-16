'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('validator')

/*
 * Function for testing of planners
 * args input
 *      planner
 *          host
 *
 * args output
 *      planner
 *          type
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.planner.host+'/id'

    if(args.debug){
        console.log('testing planner server ... '+args.planner.host);
    }
    request.get({url:url},function(error,response){
        if(!error){
            if(validator.isJSON(response.body)){
                var parse=JSON.parse(response.body);

                if(response.statusCode==200){
                    if(parse.planner){
                        args.planner.type=parse.type;
                        deferred.resolve(args);
                        return;
                    }
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

