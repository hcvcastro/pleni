'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for list databases in couchdb server
 * args input
 *      db
 *          host
 *          list
 *      auth
 *          cookie
 *
 * args output
 *      db
 *          list
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/_all_dbs'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    request.get({url:url,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                args.db.list=JSON.parse(response.body);
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

