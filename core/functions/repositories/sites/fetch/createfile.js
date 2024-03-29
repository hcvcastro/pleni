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
 *          file
 *              id
 *              _rev
 */
module.exports=function(args){
    var deferred=Q.defer()
      , parse=_url.parse(args.task.wait.url)
      , ts=Date.now()
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , pathname=parse.pathname
      , escape=args.db.host.substr(-9)!='/dbserver'

    if(escape){
        pathname=pathname.replace(/\//g,'%2F');
    }

    var document=['file',pathname].join('::')
      , url=args.db.host+'/'+args.db.name+'/'+document

    if(!/text\/html/i.test(args.task.head.headers['content-type'])){
        if(args.debug){
            console.log('create a file document ...'+url);
        }

        request.put({
            url:url
          , headers:headers
          , json:{
                status:'wait'
              , ts_created:ts
              , ts_modified:ts
              , current:{
                    head:{
                        url:args.task.wait.url
                      , method:'HEAD'
                      , status:args.task.head.status
                      , headers:args.task.head.headers
                      , ts_created:ts
                      , ts_modified:ts
                    }
                }
              , revs:[{
                    url:args.task.wait.url
                  , method:'HEAD'
                  , status:args.task.head.status
                  , headers:args.task.head.headers
                  , ts_created:ts
                  , ts_modified:ts
                }]
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

