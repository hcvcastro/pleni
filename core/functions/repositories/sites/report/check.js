'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for checking of a design document _design/report
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
 *              check
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/_design/report'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        };

    if(args.debug){
        console.log('checking a design document for basic report');
    }
    request.head({url:url,headers:headers},function(error,response){
        if(!error){
            if(!args.site){
                args.site={};
            }
            if(!args.site.report){
                args.site.report={};
            }
            if(response.statusCode==200){
                args.site.report.check=true;
            }else{
                args.site.report.check=false;
            }
            deferred.resolve(args);
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

