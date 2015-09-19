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
 *              _rev
 *              url
 *              ts_created
 *
 * args output
 *      task
 *          lock
 *              id
 *              _rev
 */
module.exports=function(args){
    var deferred=Q.defer()
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            _rev:args.task.wait._rev
          , status:'lock'
          , ts_created:args.task.wait.ts_created
          , ts_modified:Date.now()
          , request:{
                url:args.task.wait.url
            }
        }
      , doc=args.task.wait.id
      , escape=args.db.host.substr(-9)!='/dbserver'

    if(escape){
        doc=doc.replace(/\//g,'%2F');
    }

    var url=args.db.host+'/'+args.db.name+'/'+doc

    if(args.debug){
        console.log('lock a wait document ...',args.task.wait.id);
    }

    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(response.statusCode==201&&response.body.ok){
                args.task.lock={
                    id:response.body.id
                  , _rev:response.body.rev
                };
                deferred.resolve(args);
            }else{
                deferred.reject(response.body);
            }
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

