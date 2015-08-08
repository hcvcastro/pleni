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
 *          type
 *
 * args output
 *      site
 *          list
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name
            +'/_changes?filter=sites/bytype&type='+args.site.type
            +'&include_docs=true'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    if(args.debug){
        console.log('get a list type',args.site.type);
    }
    request.get({url:url,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                var parse=JSON.parse(response.body);
                if(!parse.error){
                    args.site.list=parse;
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

