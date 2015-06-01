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
      , url=args.db.host+'/id'

    if(!args.db.check){
        if(args.debug){
            console.log('testing couch db server ... '+args.db.host);
        }
        request.get({url:url},function(error,response){
            if(!error){
                if(validator.isJSON(response.body)){
                    var parse=JSON.parse(response.body);

                    if(response.statusCode==200
                        &&parse.resources
                        &&parse.resources.dbservers){
                            args.db.check=true;
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
    }else{
        deferred.resolve(args);
    }

    return deferred.promise;
};

