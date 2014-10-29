'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for creation of rootsite document for site fetching
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
 *          root
 */
exports.rootsite=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/'+encodeURIComponent('page_/')
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            status:'wait'
          , type:'page'
          , url:args.site.url
          , timestamp:Date.now()
        }

    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            args.site.root=response.body.rev;
            deferred.resolve(args);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};
