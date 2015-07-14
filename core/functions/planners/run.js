'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for run a task in planner
 * args input
 *      auth (*)
 *          cookie
 *          ts
 *      planner
 *          host
 *          tid <-- task id
 *          seed <-- optional parameter for concurrence
 *      targs <-- arguments needed for task
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.planner.host+'/'+args.planner.tid+'/_run'
      , headers={}
      , body=args.targs

    if(args.debug){
        console.log('run a task in planner ... '+args.planner.host);
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
        request.post({url:url,headers:headers,json:body},
        function(error,response){
            if(!error){
                if(response.statusCode==200){
                    deferred.resolve(args);
                }else{
                    deferred.reject(response.body);
                }
            }
            deferred.reject(error);
        });
    }

    return deferred.promise;
};

