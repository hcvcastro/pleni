'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for unset a task from planner
 * args definition
 *      auth (*)
 *          cookie
 *          ts
 *      planner
 *          host
 *          tid <-- task id
 *          seed <-- optional parameter for concurrence
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.planner.host+'/'+args.planner.tid
      , headers={}

    if(args.debug){
        console.log('unset a task for planner ... '+args.planner.host);
    }

    if(args.auth&&args.auth.cookie){
        headers['Cookie']=[args.auth.cookie];

        if(args.planner.seed){
            headers['Cookie'].push('seed='+args.planner.seed);
        }
    }

    if(!args.planner.tid){
        deferred.reject({error:'not tid provided'});
    }else{
        request.del({url:url,headers:headers},function(error,response){
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
    }

    return deferred.promise;
};

