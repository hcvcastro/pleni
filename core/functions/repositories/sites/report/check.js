'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for checking of a desing document _design/reports
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *
 * args output
 *      report
 *          basic
 *              check
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/_design/reports'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        };

    if(args.debug){
        console.log('checking a design document for basic report');
    }
    request.head({url:url,headers:headers},function(error,response){
        if(!error){
            if(!args.report){
                args.report={};
            }
            if(!args.report.basic){
                args.report.basic={};
            }
            if(response.statusCode==200){
                args.report.basic.check=true;
            }else{
                args.report.basic.check=false;
            }
            deferred.resolve(args);
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

