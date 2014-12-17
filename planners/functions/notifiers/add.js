'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for add planner in a notifier
 * args input
 *      notifier
 *          host
 *      planner
 *          host
 *          port
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.notifier.host+'/notifier/_add'
      , body={
            planner:args.planner
        }

    if(args.debug){
        console.log('add client for notifier ... '
            +args.planner.host+':'+args.planner.port);
    }
    request.post({url:url,json:body},function(error,response){
        if(!error){
            if(response.statusCode==200||response.statusCode==201){
                deferred.resolve(args);
                return;
            }
            deferred.reject(response.body);
            return;
        }
        deferred.reject(error);
        return;
    });

    return deferred.promise;
};

