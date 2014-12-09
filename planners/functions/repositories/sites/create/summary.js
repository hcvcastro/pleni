'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('../../../../utils/validators')

/*
 * Function for creation of summary document in fetch sites
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *      site
 *          url
 *
 * args output
 *      site
 *          summary
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/summary'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            type:'site'
          , url:validator.toValidHost(args.site.url)
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

