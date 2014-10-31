'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for run a task in planner
 * args input
 *      planner
 *          host
 *          tid <-- task id
 *          targs <-- arguments needed for task
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.planner.host+'/'+args.planner.tid+'/_run'
      , body=args.planner.targs

    request.post({url:url,json:body},function(error,response){
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

