'use strict';

var request=require('request')
  , Q=require('q')
  , _url=require('url')

/*
 * Function for creation of page document for site fetching
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *      task
 *          wait
 *              url
 *          head
 *              status
 *              headers
 *
 * args output
 *      task
 *          page
 *              id
 *              _rev
 */
module.exports=function(args){
    var deferred=Q.defer()
      , parse=_url.parse(args.task.wait.url)
      , ts=Date.now()
      , document=['file',parse.pathname].join('::')
      , url=args.db.host+'/'+args.db.name+'/'+document
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    if(!/text\/html/i.test(args.task.head.headers['content-type'])){
        if(args.debug){
            console.log('create a file document ...'+url);
        }

        request.put({url:url,headers:headers
          , json:{
                status:'wait'
              , ts_created:ts
              , ts_modified:ts
              , statuscode:args.task.head.status
              , mimetype:args.task.head.headers['content-type']
              , filesize:args.task.head.headers['content-length']
            }
        },function(error,response){
            if(!error){
                args.task.file={
                    id:response.body.id
                  , _rev:response.body.rev
                };
                deferred.resolve(args);
            }else{
                deferred.reject(error);
            }
        });
    }else{
        deferred.resolve(args);
    }

    return deferred.promise;
};

