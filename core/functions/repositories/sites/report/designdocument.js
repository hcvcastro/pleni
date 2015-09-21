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
      , url=args.db.host+'/'+args.db.name+'/_design/reports'
      , flag=false
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            'language':'javascript'
          , 'views':{
                'header-server':{
                    'map':'function(doc){switch(doc._id.substring(0,4)){case \''
                        +'page\':if(doc.current&&doc.current.get){emit(doc.curr'
                        +'ent.get.headers[\'server\']);}break;case \'file\':if('
                        +'doc.current&&doc.current.head){emit(doc.current.head.'
                        +'headers[\'server\']);}break;}}'
                  , 'reduce':'_count'
                }
              , 'header-poweredby':{
                    'map':'function(doc){switch(doc._id.substring(0,4)){case \''
                        +'page\':if(doc.current&&doc.current.get){emit(doc.curr'
                        +'ent.get.headers[\'x-powered-by\']);}break;case \'file'
                        +'\':if(doc.current&&doc.current.head){emit(doc.current'
                        +'.head.headers[\'x-powered-by\']);}break;}}'
                  , 'reduce':'_count'
                }
              , 'header-contenttype':{
                    'map':'function(doc){switch(doc._id.substring(0,4)){case \''
                        +'page\':if(doc.current&&doc.current.get){emit(doc.curr'
                        +'ent.get.headers[\'content-type\']);}break;case \'file'
                        +'\':if(doc.current&&doc.current.head){emit(doc.current'
                        +'.head.headers[\'content-type\']);}break;}}'
                  , 'reduce':'_count'
                }
              , 'header-status':{
                    'map':'function(doc){switch(doc._id.substring(0,4)){case \''
                        +'page\':if(doc.current&&doc.current.get){emit(doc.curr'
                        +'ent.get.status);}break;case \'file\':if(doc.current&&'
                        +'doc.current.head){emit(doc.current.head.status);}brea'
                        +'k;}}'
                  , 'reduce':'_count'
                }
              , 'hashes':{
                    'map':'function(doc){if(doc._id.substring(0,4)==\'page\'){i'
                        +'f(doc.current&&doc.current.get){emit(doc._id.substrin'
                        +'g(6),[doc.current.get.sha1,doc.current.get.md5]);}}}'
                }
              , 'rels':{
                    'map':'function(doc){if(doc._id.substring(0,4)==\'page\'){i'
                        +'f(doc.current&&doc.current.get&&doc.current.get.rels)'
                        +'{for(var i in doc.current.get.rels){emit([doc.current'
                        +'.get.rels[i].tag,doc.current.get.rels[i].url]);}}}}'
                  , 'reduce':'_count'
                }
              , 'refs':{
                    'map':'function(doc){if(doc._id.substring(0,4)==\'page\'){i'
                        +'f(doc.current&&doc.current.get&&doc.current.get.refs)'
                        +'{for(var i in doc.current.get.refs){emit([doc.current'
                        +'.get.refs[i].tag,doc.current.get.refs[i].url]);}}}}'
                  , 'reduce':'_count'
                }
            }
        };

    if(args.site&&args.site.report&&args.site.report.check){
        flag=args.site.report.check
    }

    if(!flag){
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

