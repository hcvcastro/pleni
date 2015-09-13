'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('../../../../validators')

/*
 * Function for creation of report document in site repository
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *      report
 *          header
 *              server
 *              status
 *              contenttype
 *              poweredby
 *          body
 *              rels
 *              refs
 *              hashes
 *
 * args output
 *      site
 *          report
 *              _rev
 */
module.exports=function(args){
    var deferred=Q.defer()
      , ts=Date.now()
      , url=args.db.host+'/'+args.db.name+'/report::'+ts
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            ts_created:Date.now()
          , server:args.report.header.server.map(function(i){
                return [i.key,i.value];
            })
          , statuscode:args.report.header.status.map(function(i){
                return [i.key,i.value];
            })
          , contenttype:args.report.header.contenttype.map(function(i){
                return [i.key,i.value];
            })
          , poweredby:args.report.header.poweredby.map(function(i){
                return [i.key||'',i.value];
            })
          , rels:args.report.body.rels.map(function(i){
                return [i.key[0],i.key[1],i.value];
            })
          , refs:args.report.body.refs.map(function(i){
                return [i.key[0],i.key[1],i.value];
            })
          , hashes:args.report.body.hashes.map(function(i){
                return [i.key,i.value[0],i.value[1]];
            })
        }

    if(args.debug){
        console.log('create a report document for site repository');
    }
    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(!args.site){
                args.site={};
            }
            if(!args.site.report){
                args.site.report={};
            }
            args.site.report._rev=response.body.rev;
            deferred.resolve(args);
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

