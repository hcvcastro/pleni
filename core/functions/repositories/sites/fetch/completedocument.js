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
 *          response
 *              status
 *              headers
 *              body
 *              sha1
 *              md5
 *          refs
 *          rels
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
      , doc='/'+encodeURIComponent(args.task.wait.id)
      , url=args.db.host+'/'+args.db.name+doc
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            _rev:args.task.lock._rev
          , status:'complete'
          , ts_created:args.task.wait.ts_created
          , ts_modified:Date.now()
          , request:{
                url:args.task.wait.url
            }
        }

    body.request.headers={};
    if(args.headers){
        args.headers.forEach(function(header){
            body.request.headers[header.name]=header.value;
        });
    }

    if(args.task.response){
        body.response=args.task.response;
    }
    if(args.task.refs){
        body.refs=args.task.refs;
    }
    if(args.task.rels){
        body.rels=args.task.rels;
    }

    if(args.debug){
        console.log('save the complete document');
    }

    request.put({url:url,headers:headers,json:body},function(error,response){
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

