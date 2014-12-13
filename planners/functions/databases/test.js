'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('validator')

/*
 * Function for test the couchdb server
 * args input
 *      db
 *          host
 *
 * args output
 *      db
 *          check
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host

    if(!args.db.check){
        if(args.debug){
            console.log('testing couch db server ... '+args.db.host);
        }
        request.get({url:url},function(error,response){
            if(!error){
                if(validator.isJSON(response.body)){
                    var parse=JSON.parse(response.body);
 
                    if(response.statusCode==200){
                        if(parse.couchdb){
                            args.db.check=true;
                            deferred.resolve(args);
                            return;
                        }
                    }
                    deferred.reject(parse);
                    return;
                }
                deferred.reject({error:'response_malformed'});
                return;
            }
            deferred.reject(error);
            return;
        });
    }else{
        deferred.resolve(args);
    }

    return deferred.promise;
};

