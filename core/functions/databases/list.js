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

    if(args.debug){
        console.log('listing the databases in ... '+args.db.host);
    }
    request.get({url:url,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                args.db.list=JSON.parse(response.body);
                deferred.resolve(args);
            }else{
                deferred.reject(response.body);
            }
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

