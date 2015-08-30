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
 *          doc
 *              id
 *
 * args output
 *      site
 *          doc
 *              content
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/'
//      , doc=encodeURIComponent(args.site.doc.id)
      , doc=args.site.doc.id
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    if(args.debug){
        console.log('get document:',args.site.doc.id);
    }
    request.get({url:url+doc,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                var parse=JSON.parse(response.body);
                if(!parse.error){
                    args.site.doc.content=parse;
                    deferred.resolve(args);
                }else{
                    deferred.reject(response);
                }
            }else{
                deferred.reject(response);
            }
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

