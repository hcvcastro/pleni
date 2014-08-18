'use strict';

var request=require('request')
  , Q=require('q')

/*
 * args definition
 *      host
 */
exports.testplanner=function(args){
    var deferred=Q.defer()
      , url=args.host

    request.get({url:url},function(error,response){
        if(!error){
            if(response.statusCode==200){
                if(JSON.parse(response.body).planner){
                    deferred.resolve(args);
                    return;
                }
            }
            deferred.reject(response.body);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};
