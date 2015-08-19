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
 *
 * args output
 *      site
 *          list
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name
      , view='/_changes?filter=sites/pages&descending=true'
      , filters1=['status']
      , filters2=args.site.filters.split('|')
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    for(var i=0;i<filters1.length;i++){
        view+='&'+filters1[i]+'='+filters2[i];
    }

    if(args.debug){
        console.log('get a pages list');
    }
    request.get({url:url+view,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                var parse=JSON.parse(response.body);
                if(!parse.error){
                    args.site.list=parse.results;
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

