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
 *          get
 *              headers
 *          refs
 *          rels
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
      , page=encodeURIComponent(parse.pathname)
      , document=['page',page].join('::')
      , url=args.db.host+'/'+args.db.name+'/'+document
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    if(args.task.get&&args.task.get.headers&&
        /text\/html/i.test(args.task.get.headers['content-type'])){
        if(args.debug){
            console.log('create a page document ...'+url);
        }

        request.put({url:url,headers:headers
          , json:{
                status:'complete'
              , ts_created:ts
              , ts_modified:ts
              , refs:args.task.refs
              , rels:args.task.rels
            }
        },function(error,response){
            if(!error){
                args.task.page={
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

