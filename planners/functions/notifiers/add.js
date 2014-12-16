'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('validator')

/*
 * Function for add planner in a notifier
 * args input
 *      planner
 *          host
 *
 * args output
 *      notifier
 *          planners
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.notifier.host+'/notifiers'

    if(args.debug){
        console.log('get a clients for notifier ... '+args.notifier.host);
    }
    request.put({url:url},function(error,response){
        if(!error){
            if(validator.isJSON(response.body)){
                var parse=JSON.parse(response.body);

                if(response.statusCode==200){
                    args.notifier.planners=parse;
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

