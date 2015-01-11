'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for clean planners in a notifier
 * args input
 *      notifier
 *          host
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.notifier.host+'/notifier'

    if(args.debug){
        console.log('clean clients for notifier ... ');
    }
    request.del({url:url},function(error,response){
        if(!error){
            if(response.statusCode==200){
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

