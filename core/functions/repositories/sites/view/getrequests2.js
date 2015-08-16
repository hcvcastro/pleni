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
 *          filters
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
      , url=args.db.host+'/'+args.db.name+'/_all_docs'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            keys:args.site.list.map(function(e){return e.id;})
                .slice(args.site.offset,args.site.limit+args.site.offset)
        }

    if(args.debug){
        console.log('get a requests list');
    }
    request.post({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(response.statusCode==200){
                console.log('body',response.body);
                deferred.resolve(args);
                /*var parse=JSON.parse(response.body);
                if(!parse.error){
                    args.site.list=parse.rows;
                    deferred.resolve(args);
                }else{
                    deferred.reject(response);
                }*/
            }else{
                deferred.reject(response);
            }
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

