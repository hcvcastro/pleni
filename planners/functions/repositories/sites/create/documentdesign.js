'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for creation of document design for fetch sites
 * args inputs
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *
 * args outputs
 *      site
 *          design
 */
exports.designdocument=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/_design/default'
      , headers={
            'Cookie':args.auth.cookie
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
            args.site.design=response.body.rev;
            deferred.resolve(args);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

