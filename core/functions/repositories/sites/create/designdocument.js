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
          , 'filters':{
                'requests':'function(doc,req){if(doc._id.substring(0,7)==\'requ'
                    +'est\'){return (function(){if(req.query.method==\'ALL\'){r'
                    +'eturn true;}else{return req.query.method==doc.request.met'
                    +'hod;}})()&&(function(){if(req.query.statuscode==\'ALL\'){'
                    +'return true;}else{if(doc.response){return +req.query.stat'
                    +'uscode==Math.floor(doc.response.status/100);}else{return '
                    +'false;}}})()&&(function(){if(req.query.status==\'ALL\'){r'
                    +'eturn true;}else{return req.query.status==doc.status;}})('
                    +');}else{return false;}}'
              , 'requestslist':'function(doc,req){var match=/request::[0-9]+::('
                    +'.+)::(.+)/.exec(doc._id);if(match){return (req.query.meth'
                    +'od==\'ALL\'||req.query.method==match[1])&&(req.query.page'
                    +'==match[2]);}else{return false;}}'
              , 'pages':'function(doc,req){if(doc._id.substring(0,4)==\'page\')'
                    +'{return (function(){if(req.query.status==\'ALL\'){return '
                    +'true;}else{return req.query.status==doc.status;}})();}els'
                    +'e{return false;}}'
              , 'files':'function(doc,req){if(doc._id.substring(0,4)==\'file\')'
                    +'{return (function(){if(req.query.status==\'ALL\'){return '
                    +'true;}else{return doc.current.head.headers[\'content-type'
                    +'\'].indexOf(req.query.mimetype)==0;}})()&&(function(){if('
                    +'req.query.status==\'ALL\'){return true;}else{return req.q'
                    +'uery.status==doc.status;}})();}else{return false;}}'
              , 'reports':'function(doc,req){if(doc._id.substring(0,6)==\'repor'
                    +'t\'){return true;}}'
            }
          , 'views':{
                'wait':{
                    'map':'function(doc){if(doc._id.substring(0,7)==\'request\''
                        +'&&doc.status&&doc.status==\'wait\'){emit(doc.request.'
                        +'url,[doc._rev,doc.ts_created]);}}'
                }
              , 'timestamp':{
                    'map':'function(doc){if(doc.ts_modified){emit(null,doc.ts_m'
                        +'odified);}}'
                  , 'reduce':'function(keys,values,rereduce){if(rereduce){retur'
                        +'n {\'min\':values.reduce(function(a,b){return Math.mi'
                        +'n(a,b.min)},Infinity),\'max\':values.reduce(function('
                        +'a,b){return Math.max(a,b.max)},-Infinity),\'count\':v'
                        +'alues.reduce(function(a,b){return a+b.count},0)};}els'
                        +'e{return {\'min\':Math.min.apply(null,values),\'max\''
                        +':Math.max.apply(null,values),\'count\':values.length}'
                        +';}}'
                }
              , 'mimetype':{
                    'map':'function(doc){if(doc._id.substring(0,4)==\'file\'){v'
                        +'ar r=/([a-z]+\\/[a-z]+).*/.exec(doc.current.head.head'
                        +'ers[\'content-type\']);if(r){emit(r[1],null);}}}'
                  , 'reduce':'_count'
                }
              , 'sitemap':{
                    'map':'function(doc){switch(doc._id.substring(0,4)){case \''
                        +'page\':emit(doc._id.substring(6),{status:doc.status,s'
                        +'tatuscode:doc.current.get.status,mimetype:\'text/html'
                        +'\',type:\'page\',rels:(function(x){if(x.current&&x.cu'
                        +'rrent.get){return x.current.get.rels.filter(function('
                        +'i){return /https?:\\/\\/[^\\/]+(\\/.*)/.test(i.url);}'
                        +').map(function(i){return /https?:\\/\\/[^\\/]+(\\/.*)'
                        +'/.exec(i.url)[1];});}else{return [];}})(doc)});break;'
                        +'case \'file\':emit(doc._id.substring(6),{status:doc.s'
                        +'tatus,statuscode:doc.current.head.status,mimetype:/^('
                        +'[a-z]+\\/[a-z-]+).*$/.exec(doc.current.head.headers['
                        +'\'content-type\'])[1],type:\'file\',rels:[]});break;}'
                        +'}'
                }
              , 'sitemapall':{
                    'map':'function(doc){switch(doc._id.substring(0,4)){case \''
                        +'page\':emit(doc._id.substring(6),{status:doc.status,s'
                        +'tatuscode:doc.current.get.status,mimetype:\'text/html'
                        +'\',type:\'page\',rels:(function(x){if(x.revs&&x.revs.'
                        +'length>0){var rels=[];x.revs.forEach(function(y){Arra'
                        +'y.prototype.push.apply(rels,y.rels);});return rels.fi'
                        +'lter(function(i){return /https?:\\/\\/[^\\/]+(\\/.*)/'
                        +'.test(i.url);}).map(function(i){return /https?:\\/\\/'
                        +'[^\\/]+(\\/.*)/.exec(i.url)[1];});}else{return [];}})'
                        +'(doc)});break;case \'file\':emit(doc._id.substring(6)'
                        +',{status:doc.status,statuscode:doc.current.head.statu'
                        +'s,mimetype:/^([a-z]+\\/[a-z-]+).*$/.exec(doc.current.'
                        +'head.headers[\'content-type\'])[1],type:\'file\',rels'
                        +':[]});break;}}'
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

