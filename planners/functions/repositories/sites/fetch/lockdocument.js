'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for lock a wating document
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *      task
 *          wait
 *              id
 *              key
 *              value
 *
 * args outputs
 *      tas
 *          lock
 *              ok
 *              id
 *              rev
 */
module.exports=function(args){
    var deferred=Q.defer()
      , doc='/'+encodeURIComponent(args.task.wait.id)
      , url=args.db.host+'/'+args.db.name+doc
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            status:'lock'
          , type:'page'
          , _rev:args.task.wait.value
          , url:args.task.wait.key
          , timestamp:Date.now()
        }

    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(response.statusCode==201){
                if(response.body.ok){
                    args.task.lock=response.body;
                    deferred.resolve(args);
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

