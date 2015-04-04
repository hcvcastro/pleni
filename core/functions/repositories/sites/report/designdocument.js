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
 *
 * args output
 *      report
 *          basic
 *              _rev
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/_design/reports'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            'language':'javascript'
          , 'views':{
                'hserver':{
                    'map':'function(doc){if(doc.head&&doc.head.headers){emit('
                         +'doc.head.headers[\'server\']);}}'
                  , 'reduce':'_count'
                }
              , 'hpoweredby':{
                    'map':'function(doc){if(doc.head&&doc.head.headers){emit('
                         +'doc.head.headers[\'x-powered-by\']);}}'
                  , 'reduce':'_count'
                }
              , 'hcontenttype':{
                    'map':'function(doc){if(doc.head&&doc.head.headers){emit('
                         +'doc.head.headers[\'content-type\']);}}'
                  , 'reduce':'_count'
                }
              , 'hstatus':{
                    'map':'function(doc){if(doc.head&&doc.head.headers){emit('
                         +'doc.head.status);}}'
                  , 'reduce':'_count'
                }
              , 'bhashes':{
                    'map':'function(doc){if(doc.get&&doc.get.sha1){emit('
                         +'doc._id.substring(5),[doc.get.sha1,doc.get.md5]);}}'
                }
              , 'bscript':{
                    'map':'function(doc){if(doc.ref&&doc.ref.links&&'
                         +'doc.ref.links.script){'
                         +'for(var i in doc.ref.links.script){emit('
                         +'doc.ref.links.script[i]);}}}'
                  , 'reduce':'_count'
                }
              , 'blink':{
                    'map':'function(doc){if(doc.ref&&doc.ref.links&&'
                         +'doc.ref.links.link){'
                         +'for(var i in doc.ref.links.link){emit('
                         +'doc.ref.links.link[i]);}}}'
                  , 'reduce':'_count'
                }
              , 'ba':{
                    'map':'function(doc){if(doc.ref&&doc.ref.links&&'
                         +'doc.ref.links.a){for(var i in doc.ref.links.a){emit('
                         +'doc.ref.links.a[i]);}}}'
                  , 'reduce':'_count'
                }
              , 'bimg':{
                    'map':'function(doc){if(doc.ref&&doc.ref.links&&'
                         +'doc.ref.links.img){for(var i in doc.ref.links.img){'
                         +'emit(doc.ref.links.img[i]);}}}'
                  , 'reduce':'_count'
                }
              , 'bform':{
                    'map':'function(doc){if(doc.ref&&doc.ref.links&&'
                         +'doc.ref.links.form){'
                         +'for(var i in doc.ref.links.form){emit('
                         +'doc.ref.links.form[i]);}}}'
                  , 'reduce':'_count'
                }
            }
        };

    if(args.debug){
        console.log('create a design document for basic report');
    }
    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(!args.report){
                args.report={};
            }
            if(!args.report.basic){
                args.report.basic={};
            }
            args.report.basic._rev=response.body.rev;
            deferred.resolve(args);
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

