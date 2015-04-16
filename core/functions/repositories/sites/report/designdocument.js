'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for creation of a design document for report basic
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *      site
 *          report
 *              check
 *
 * args output
 *      site
 *          design
 *              _rev
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/_design/report'
      , flag=true
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            'language':'javascript'
          , 'views':{
                'header-server':{
                    'map':'function(doc){if(doc.head&&doc.head.headers){emit('
                         +'doc.head.headers[\'server\']);}}'
                  , 'reduce':'_count'
                }
              , 'header-poweredby':{
                    'map':'function(doc){if(doc.head&&doc.head.headers){emit('
                         +'doc.head.headers[\'x-powered-by\']);}}'
                  , 'reduce':'_count'
                }
              , 'header-contenttype':{
                    'map':'function(doc){if(doc.head&&doc.head.headers){emit('
                         +'doc.head.headers[\'content-type\']);}}'
                  , 'reduce':'_count'
                }
              , 'header-status':{
                    'map':'function(doc){if(doc.head&&doc.head.headers){emit('
                         +'doc.head.status);}}'
                  , 'reduce':'_count'
                }
              , 'hashes':{
                    'map':'function(doc){if(doc.get&&doc.get.sha1){emit('
                         +'doc._id.substring(5),[doc.get.sha1,doc.get.md5]);}}'
                }
              , 'rels':{
                    'map':'function(doc){if(doc.rels){for(var i in doc.rels){'
                         +'emit([doc.rels[i].tag,doc.rels[i].url]);}}}'
                  , 'reduce':'_count'
                }
              , 'refs':{
                    'map':'function(doc){if(doc.refs){for(var i in doc.refs){'
                         +'emit([doc.refs[i].tag,doc.refs[i].url]);}}}'
                  , 'reduce':'_count'
                }
            }
        };


    if(args.site&&args.site.report&&args.site.report.check){
        flag=args.site.report.check
    }

    if(flag){
        if(args.debug){
            console.log('create a design document for basic report');
        }
        request.put({
            url:url
          , headers:headers
          , json:body
        },function(error,response){
            if(!error){
                if(!args.site){
                    args.site={};
                }
                if(!args.site.design){
                    args.site.design={};
                }
                args.site.design._rev=response.body.rev;
                deferred.resolve(args);
            }else{
                deferred.reject(error);
            }
        });
    }else{
        deferred.resolve(args);
    }

    return deferred.promise;
};

