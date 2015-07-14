'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for stop a task in planner
 * args input
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
      , url=args.planner.host+'/'+args.planner.tid+'/_stop'
      , headers={}

    if(args.debug){
        console.log('stop a task in planner ... '+args.planner.host);
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
        request.post({url:url,headers:headers},function(error,response){
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

