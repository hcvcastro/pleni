'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for create a database from couchdb server
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 */
exports.create=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    request.put({url:url,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==201){
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

