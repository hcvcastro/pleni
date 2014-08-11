'use strict';

var request=require('request')
  , Q=require('q')

/*
 * args definition
 *      host
 *      dbname
 *      cookie <- getting from auth
 *      site_type
 *      site_url
 */
exports.createsummary=function(args){
    var deferred=Q.defer()
      , url=args.host+'/'+args.dbname+'/summary'
      , headers={
            'Cookie':args.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            type:args.site_type
          , url:args.site_url
        }

    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            args['rev_summary']=response.body.rev;
            deferred.resolve(args);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

/*
 * args definition
 *      host
 *      dbname
 *      cookie <- getting from auth
 *      site_url
 */
exports.createrootsite=function(args){
    var deferred=Q.defer()
      , url=args.host+'/'+args.dbname+'/'+encodeURIComponent('page_/')
      , headers={
            'Cookie':args.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            status:'wait'
          , url:args.site_url
          , type:'page'
          , timestamp:Date.now()
        }

    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            args['rev_root']=response.body.rev;
            deferred.resolve(args);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

/*
 * args definition
 *      host
 *      dbname
 *      cookie <- getting from auth
 */
exports.createdesigndocument=function(args){
    var deferred=Q.defer()
      , url=args.host+'/'+args.dbname+'/_design/default'
      , headers={
            'Cookie':args.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            'language':'javascript'
          , 'views':{
                'wait':{
                    'map':'function(doc){if(doc.status&&doc.status'
                         +'==\'wait\'){emit(doc.url,doc._rev)}}',
                },
            }
        };

    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            args['rev_design']=response.body.rev;
            deferred.resolve(args);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

