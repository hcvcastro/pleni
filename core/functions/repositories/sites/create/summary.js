'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('../../../../validators')

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
 *              _rev
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/%40summary'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , ts=Date.now()
      , body={
            type:'site'
          , url:args.site.url
          , ts_created:ts
          , ts_modified:ts
        }

    if(args.debug){
        console.log('create a summary document for site repository');
    }

    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(!args.site){
                args.site={};
            }
            if(!args.site.summary){
                args.site.summary={};
            }
            args.site.summary._rev=response.body.rev;
            deferred.resolve(args);
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

