'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for creation of a design document for fetch sites
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *
 * args output
 *      site
 *          design
 *              timestamp
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/_design/timestamp'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            'language':'javascript'
          , 'views':{
                'timestamp':{
                    'map':'function(doc){if(doc.timestamp){emit(null,'
                         +'doc.timestamp)}}',
                    'reduce':'function(keys,values,rereduce){if(rereduce){'
                            +'return{\'min\':values.reduce(function(a,b){'
                            +'return Math.min(a,b.min)},Infinity),\'max\':'
                            +'values.reduce(function(a,b){return Math.max(a,'
                            +'b.max)},-Infinity),\'count\':values.reduce('
                            +'function(a,b){return a+b.count},0)}}else{return{'
                            +'\'min\':Math.min.apply(null,values),\'max\':'
                            +'Math.max.apply(null,values),\'count\':'
                            +'values.length}}}'
                }
            }
        };

    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(args.debug){
                console.log('put a design document timestamp');
            }
            if(!args.site){
                args.site={};
            }
            if(!args.site.design){
                args.site.design={};
            }
            if(!response.body.error){
                args.site.design.timestamp=response.body.rev;
            }
            deferred.resolve(args);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

