'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for get a document in wait status
 * args inputs
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *
 * args outputs
 *      task
 *          wait
 *              id
 *              key
 *              value
 */
module.exports=function(args){
    var deferred=Q.defer()
      , view='/_design/default/_view/wait'
      , url=args.db.host+'/'+args.db.name+view+'?limit=1'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    request.get({url:url,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                var json=JSON.parse(response.body);
                if(json.total_rows!=0){
                    if(!args.task){
                        args.task={};
                    }
                    args.task.wait=json.rows[0];
                    deferred.resolve(args);
                    return;
                }else{
                    deferred.reject({"complete":true});
                    return;
                }
            }
            deferred.reject(response.body);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

