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
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    if(args.debug){
        console.log('get information from ... '+url);
    }
    request.get({url:url,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                args.db.info=response.body;
                deferred.resolve(args);
            }else{
                deferred.reject(JSON.parse(response.body));
            }
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

