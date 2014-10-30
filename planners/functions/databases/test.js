'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for test the couchdb server
 * args inputs
 *      db
 *          host
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host

    request.get({url:url},function(error,response){
        if(!error){
            if(response.statusCode==200){
                if(JSON.parse(response.body).couchdb){
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

