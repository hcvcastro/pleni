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
 *              status
 *              headers
 *              body
 *              md5
 *              sha1
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
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , pathname=parse.pathname
      , escape=args.db.host.substr(-9)!='/dbserver'

    if(escape){
        pathname=pathname.replace(/\//g,'%2F');
    }

    var document=['page',pathname].join('::')
      , url=args.db.host+'/'+args.db.name+'/'+document

    if(args.task.get&&args.task.get.headers&&
        /text\/html/i.test(args.task.get.headers['content-type'])){
        if(args.debug){
            console.log('create a page document ...',document);
        }

        request.put({
            url:url
          , headers:headers
          , json:{
                status:'complete'
              , ts_created:ts
              , ts_modified:ts
              , current:{
                    get:{
                        url:args.task.wait.url
                      , method:'GET'
                      , status:args.task.get.status
                      , headers:args.task.get.headers
                      , body:args.task.get.body
                      , md5:args.task.get.md5
                      , sha1:args.task.get.sha1
                      , refs:args.task.refs
                      , rels:args.task.rels
                      , ts_created:ts
                      , ts_modified:ts
                    }
                }
              , revs:[{
                    url:args.task.wait.url
                  , method:'GET'
                  , status:args.task.get.status
                  , headers:args.task.get.headers
                  , body:args.task.get.body
                  , md5:args.task.get.md5
                  , sha1:args.task.get.sha1
                  , refs:args.task.refs
                  , rels:args.task.rels
                  , ts_created:ts
                  , ts_modified:ts
                }]
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

