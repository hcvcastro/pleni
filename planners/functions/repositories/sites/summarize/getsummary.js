'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for register the timestamps in the summary in a site repository
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *
 * args output
 *      site
 *          summary
 *              _id
 *              _rev
 *              type
 *              url
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/summary'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    request.get({url:url,headers:headers},function(error,response){
        if(!error){
            if(!args.site){
                args.site={};
            }
            args.site.summary=response.body;
            deferred.resolve(args);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

