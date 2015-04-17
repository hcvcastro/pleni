'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for execute map/reduce for refs information in repository
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *
 * args output
 *      report
 *          refs
 */
module.exports=function(args){
    var deferred=Q.defer()
      , view='/_design/report/_view/refs'
      , url=args.db.host+'/'+args.db.name+view
      , params='?reduce=true&group=true&group_level=2'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    if(args.debug){
        console.log('get header status information ... ');
    }
    request.get({url:url+params,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                var json=JSON.parse(response.body);
                if(!args.report){
                    args.report={};
                }
                args.report.refs=json.rows;
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

