'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('validator')

/*
 * Function for get planners in a notifier
 * args input
 *      notifier
 *          host
 *          cookie
 *
 * args output
 *      notifier
 *          planners
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.notifier.host+'/notifier'

    if(args.debug){
        console.log('get a clients for notifier ... '+args.notifier.host);
    }
    request.get({
        url:url
      , headers:{
            'cookie':args.notifier.cookie
        }
    },function(error,response){
        if(!error){
            if(validator.isJSON(response.body)){
                var parse=JSON.parse(response.body);

                if(response.statusCode==200){
                    args.notifier.planners=parse;
                    deferred.resolve(args);
                }else{
                    deferred.reject(parse);
                }
            }else{
                deferred.reject({error:'response_malformed'});
            }
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

