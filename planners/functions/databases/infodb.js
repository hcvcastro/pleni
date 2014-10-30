'use strict';

var request=require('request')
  , Q=require('q');

/*
 * Function for getting database information from couchdb server
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *
 * args output
 *      db
 *          info
 */
exports.info=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    request.get({url:url,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                args.db.info=response.body
                deferred.resolve(args);
                return;
            }
            deferred.reject(response.body);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

