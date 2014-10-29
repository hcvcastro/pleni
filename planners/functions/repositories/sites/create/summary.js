'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for creation of summary document in fetch sites
 * args inputs
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *      site
 *          url
 *
 * args outputs
 *      site
 *          summary
 */
exports.summary=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/summary'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            type:'site'
          , url:args.site.url
        }

    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            args.site.summary=response.body.rev;
            deferred.resolve(args);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

