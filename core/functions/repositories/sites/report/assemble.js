'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('../../../../validators')

/*
 * Function for creation of report document in site repository
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *
 * args output
 *      site
 *          report
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/report'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            ts_created:Date.now()
          , ts_modified:Date.now()
        }

    if(args.debug){
        console.log('create a report document for site repository');
    }
    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(!args.site){
                args.site={};
            }
            if(!args.site.report){
                args.site.report={};
            }
            args.site.report._rev=response.body.rev;
            deferred.resolve(args);
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

