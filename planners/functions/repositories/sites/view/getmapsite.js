'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for getting the map site schema in a site repository
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *
 * args output
 *      site
 *          mapsite
 */
module.exports=function(args){
    var deferred=Q.defer()
      , view='/_design/sites/_view/mapsite'
      , url=args.db.host+'/'+args.db.name+view
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    if(args.debug){
        console.log('get a mapsite document');
    }
    request.get({url:url,headers:headers},function(error,response){
        if(!error){
            if(!args.site){
                args.site={};
            }
            args.site.mapsite=JSON.parse(response.body).rows;
            deferred.resolve(args);
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};
