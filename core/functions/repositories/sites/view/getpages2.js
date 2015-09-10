'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for getting a list of documents in a site repository
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *      site
 *          offset
 *          limit
 *          list
 *
 * args output
 *      site
 *          total
 *          list
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/_all_docs?include_docs=true'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            keys:args.site.list.map(function(e){return e.id;})
                .slice(+args.site.offset,+args.site.limit+ +args.site.offset)
        }

    if(args.debug){
        console.log('get a pages list');
    }
    request.post({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(response.statusCode==200){
                args.site.total=args.site.list.length
                args.site.list=response.body.rows.map(function(e){
                    var packet={
                            id:e.id
                          , status:e.doc.status
                          , statuscode:e.doc.statuscode
                          , ts_created:e.doc.ts_created
                          , ts_modified:e.doc.ts_modified
                        }

                    if(e.doc.response){
                        packet.response={
                            status:e.doc.response.status
                        };
                    }

                    return packet;
                });

                deferred.resolve(args);
            }else{
                deferred.reject(response);
            }
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

