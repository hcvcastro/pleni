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
 *              _rev
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
          , ts_created:Date.now()
          , ts_modified:Date.now()
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

