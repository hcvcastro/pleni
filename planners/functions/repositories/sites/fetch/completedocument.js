'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for change status in document for fetch
 * args inputs
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
 *          lock
 *              ok
 *              id
 *              rev
 *          head
 *              status
 *              headers
 *              get
 *          get
 *              status
 *              headers
 *              body
 *              sha1
 *              md5
 *          ref
 *              links
 *              related
 *      headers(*)
 *      
 * args outputs
 *      task
 *          complete
 *              ok
 *              id
 *              rev
 */
module.exports=function(args){
    var deferred=Q.defer()
      , doc='/'+encodeURIComponent(args.task.lock.id)
      , url=args.db.host+'/'+args.db.name+doc
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            status:'complete'
          , type:'page'
          , _rev:args.task.lock.rev
          , url:args.task.wait.key
          , timestamp:Date.now()
        }

    if(args.headers){
        body.headers=args.headers;
    }
    body.head=args.task.head;
    if(args.task.head.get){
        body.get=args.task.get;
        body.ref=args.task.ref;
    }

    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(response.statusCode==201){
                if(response.body.ok){
                    args.task.complete=response.body;
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

