'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for execute map/reduce for content-type header extraction
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *
 * args output
 *      report
 *          header
 *              contenttype
 */
module.exports=function(args){
    var deferred=Q.defer()
      , view='/_design/reports/_view/header-contenttype'
      , url=args.db.host+'/'+args.db.name+view
      , params='?reduce=true&group=true&group_level=1'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    if(args.debug){
        console.log('get header content-type information ... ');
    }
    request.get({url:url+params,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                var json=JSON.parse(response.body);
                if(!args.report){
                    args.report={};
                }
                if(!args.report.header){
                    args.report.header={};
                }
                args.report.header.contenttype=json.rows;
                deferred.resolve(args);
            }else{
                deferred.reject(response.body);
            }
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

