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
    console.log(args);
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/summary'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            _id:args.site.summary._id
          , _rev:args.site.summary._rev
          , type:args.site.summary.type
          , url:args.site.summary.url
          , starttime:args.task.timestamp.min
          , endtime:args.task.timestamp.max
          , count:args.task.timestamp.count
        }

    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(args.debug){
                console.log('summarizing a site');
            }
            console.log(response);
            args.site.summary._rev=response.body.rev;
            deferred.resolve(args);
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

