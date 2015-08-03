'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for getting a summary document in a site repository
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
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/%40summary'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    if(args.debug){
        console.log('get a summary document');
    }
    request.get({url:url,headers:headers},function(error,response){
        if(!error){
            var parse=JSON.parse(response.body);
            if(!parse.error){
                if(!args.site){
                    args.site={};
                }
                args.site.summary=parse;
                deferred.resolve(args);
            }else{
                deferred.reject(response);
            }
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

