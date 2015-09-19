'use strict';

var request=require('request')
  , Q=require('q')
  , _url=require('url')

/*
 * Function for create of request for get fetching
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
 *              sha1
 *              md5
 *      headers(*)
 */
module.exports=function(args){
    var deferred=Q.defer()
      , parse=_url.parse(args.task.wait.url)
      , ts=Date.now()
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , headers2={}
      , pathname=parse.pathname
      , escape=args.db.host.substr(-9)!='/dbserver'

    if(escape){
        pathname=pathname.replace(/\//g,'%2F');
    }

    var document=['request',ts,'GET',pathname].join('::')
      , url=args.db.host+'/'+args.db.name+'/'+document

    if(args.headers){
        args.headers.forEach(function(header){
            headers2[header.name]=header.value;
        });
    }

    if(args.task.get){
        if(args.debug){
            console.log('create a request registry for site repository');
        }

        request.put({url:url,headers:headers
          , json:{
                status:'complete'
              , ts_created:ts
              , ts_modified:ts
              , request:{
                    url:args.task.wait.url
                  , method:'GET'
                  , headers:headers2
                }
              , response:args.task.get
            }
        },function(error,response){
            if(!error){
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

