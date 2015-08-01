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
 *              _rev
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/_design/sites'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            'language':'javascript'
          , 'views':{
                'wait':{
                    'map':'function(doc){if(doc._id.substring(0,7)==\'request\''
                        +'&&doc.status&&doc.status==\'wait\'){'
                        +'emit(doc.request.url,[doc._rev,doc.ts_created])}}'
                }
              , 'timestamp':{
                    'map':'function(doc){if(doc.ts_modified){emit(null,'
                         +'doc.ts_modified)}}',
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
              , 'sitemap':{
                    'map':'function(doc){if(doc.type&&doc.type==\'page\'){if('
                         +'doc.status==\'complete\'){var m=doc.head.headers'
                         +'[\'content-type\'].match(/[a-z]+\\/[a-z-]+/i)[0];'
                         +'emit(doc._id.substring(5),{status:doc.head.status'
                         +',mime:m,get:doc.head.get,type:(function(x,y){if('
                         +'x==\'page_/\'){return \'root\';}else{if(y.indexOf('
                         +'\'text/html\')==0){return \'page\';}else{return '
                         +'\'extra\';}}})(doc._id,m),rel:(function(x){if(x.rels'
                         +'){return x.rels.map(function(i){return i.url;});}'
                         +'else{return [];}})(doc)});}else{emit('
                         +'doc._id.substring(5),{});}}}'
                }
            }
        };

    if(args.debug){
        console.log('create a design document for site repository');
    }
    request.put({url:url,headers:headers,json:body},function(error,response){
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

    return deferred.promise;
};

