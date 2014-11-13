'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for get a document in wait status
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *
 * args output
 *      task
 *          timestamp
 *              min
 *              max
 *              count
 */
module.exports=function(args){
    var deferred=Q.defer()
      , view='/_design/timestamp/_view/timestamp'
      , url=args.db.host+'/'+args.db.name+view+'?limit=1'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    if(args.debug){
        console.log('get a timestamp document ... ');
    }
    request.get({url:url,headers:headers},function(error,response){
        if(!error){
            if(args.debug){
                console.log('getting a timestamp view');
            }
            if(response.statusCode==200){
                var json=JSON.parse(response.body);
                if(!args.task){
                    args.task={};
                }
                args.task.timestamp=json.rows[0].value;
                deferred.resolve(args);
                return;
            }
            deferred.reject(response.body);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

