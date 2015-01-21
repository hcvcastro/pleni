'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for remove planner in a notifier
 * args input
 *      notifier
 *          host
 *      planner
 *          host
 *          port
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.notifier.host+'/notifier/_remove'
      , body={
            planner:args.planner
        }

    if(args.debug){
        console.log('remove client for notifier ... '
            +args.planner.host+':'+args.planner.port);
    }
    request.post({url:url,json:body},function(error,response){
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

