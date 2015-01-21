'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for unset a task from planner
 * args definition
 *      planner
 *          host
 *          tid <-- task id
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.planner.host+'/'+args.planner.tid

    request.del({url:url},function(error,response){
        if(!error){
            if(response.statusCode==200){
                deferred.resolve(args);
            }else{
                deferred.reject(response.body);
            }
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

