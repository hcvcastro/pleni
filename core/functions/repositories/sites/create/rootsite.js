'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('../../../../validators')

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
      , url=args.db.host+'/'+args.db.name+'/'+encodeURIComponent('page_/')
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            status:'wait'
          , type:'page'
          , url:validator.toValidHost(args.site.url)
          , ts_created:Date.now()
          , ts_modified:Date.now()
        }

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

