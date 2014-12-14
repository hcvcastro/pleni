'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('validator')

/*
 * Function for testing of notifiers
 * args input
 *      notifier
 *          host
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.notifier.host+'/notifier'

    if(args.debug){
        console.log('testing notifier server ... '+args.notifier.host);
    }
    request.get({url:url},function(error,response){
        if(!error){
            if(validator.isJSON(response.body)){
                var parse=JSON.parse(response.body);

                if(response.statusCode==200){
                    if(parse.notifier){
                        deferred.resolve(args);
                        return;
                    }
                }
                deferred.reject(response.body);
                return;
            }
            deferred.reject({error:'response_malformed'});
            return;
        }
        deferred.reject(error);
        return;
    });

    return deferred.promise;
};

