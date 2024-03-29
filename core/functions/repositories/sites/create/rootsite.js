'use strict';

var request=require('request')
  , Q=require('q')
  , _url=require('url')

/*
 * Function for creation of rootsite document for site fetching
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *      site
 *          url
 *
 * args output
 *      site
 *          root
 *              _rev
 */
module.exports=function(args){
    var deferred=Q.defer()
      , parse=_url.parse(args.site.url)
      , ts=Date.now()
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            status:'wait'
          , ts_created:ts
          , ts_modified:ts
          , request:{
                url:args.site.url
              , method:'HEAD'
            }
        }
      , pathname=parse.pathname
      , escape=args.db.host.substr(-9)!='/dbserver'

    if(escape){
        pathname=pathname.replace(/\//g,'%2F');
    }

    var document=['request',ts,'HEAD',pathname].join('::')
      , url=args.db.host+'/'+args.db.name+'/'+document

    if(args.debug){
        console.log('create a root site for site repository');
    }

    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(!args.site){
                args.site={};
            }
            if(!args.site.root){
                args.site.root={};
            }
            args.site.root._rev=response.body.rev;
            deferred.resolve(args);
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

