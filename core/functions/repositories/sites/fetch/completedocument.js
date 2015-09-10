'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for change status in document for fetch
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *      task
 *          wait
 *              id
 *              url
 *              ts_created
 *          lock
 *              _rev
 *          head
 *              status
 *              headers
 *      headers(*)
 *      
 * args output
 *      task
 *          complete
 *              id
 *              _rev
 */
module.exports=function(args){
    var deferred=Q.defer()
      , ts=Date.now()
      , url=args.db.host+'/'+args.db.name+'/'+args.task.wait.id
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , headers2={}

    if(args.headers){
        args.headers.forEach(function(header){
            headers2[header.name]=header.value;
        });
    }

    if(args.debug){
        console.log('save the complete document');
    }

    request.put({url:url,headers:headers
      , json:{
            _rev:args.task.lock._rev
          , status:'complete'
          , ts_created:args.task.wait.ts_created
          , ts_modified:ts
          , request:{
                url:args.task.wait.url
              , method:'HEAD'
              , headers:headers2
            }
          , response:args.task.head
        }
    },function(error,response){
        if(!error){
            if(response.statusCode==201&&response.body.ok){
                args.task.complete={
                    id:response.body.id
                  , _rev:response.body.rev
                };
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

