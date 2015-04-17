'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for execute map/reduce for powered-by header extraction
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
 *              poweredby
 */
module.exports=function(args){
    var deferred=Q.defer()
      , view='/_design/report/_view/header-poweredby'
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
                args.report.header.poweredby=json.rows;
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

