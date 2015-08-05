'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for register the timestamps in the summary in a site repository
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *      site
 *          summary
 *              _id
 *              _rev
 *              ts_created
 *              ts_modified
 *              type
 *              url
 *      task
 *          timestamp
 *              min
 *              max
 *              count
 *
 * args output
 *      site
 *          summary
 *              _rev
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/%40summary'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            _id:args.site.summary._id
          , _rev:args.site.summary._rev
          , ts_created:args.site.summary.ts_created
          , ts_modified:args.site.summary.ts_modified
          , type:args.site.summary.type
          , url:args.site.summary.url
          , ts_started:args.task.timestamp.min
          , ts_ended:args.task.timestamp.max
          , count:args.task.timestamp.count
        }

    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(args.debug){
                console.log('summarizing a site');
            }
            args.site.summary._rev=response.body.rev;
            deferred.resolve(args);
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

