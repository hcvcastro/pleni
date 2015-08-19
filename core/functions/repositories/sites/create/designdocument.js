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
                    +'return true;}else{return +req.query.statuscode==Math.floo'
                    +'r(doc.response.status/100);}})()&&(function(){if(req.quer'
                    +'y.status==\'ALL\'){return true;}else{return req.query.sta'
                    +'tus==doc.status;}})();}else{return false;}}'
              , 'pages':'function(doc,req){if(doc._id.substring(0,4)==\'page\')'
                    +'{return (function(){if(req.query.status==\'ALL\'){return '
                    +'true;}else{return req.query.status==doc.status;}})();}els'
                    +'e{return false;}}'
              , 'files':'function(doc,req){if(doc._id.substring(0,4)==\'file\')'
                    +'{return (function(){if(req.query.mimetype==\'ALL\'){retur'
                    +'n true;}else{return req.query.mimetype==doc.mimetype;}})('
                    +')&&(function(){if(req.query.status==\'ALL\'){return true;'
                    +'}else{return req.query.status==doc.status;}})();}else{ret'
                    +'urn false;}}'
            }
          , 'views':{
                'wait':{
                    'map':'function(doc){if(doc._id.substring(0,7)==\'request\''
                        +'&&doc.status&&doc.status==\'wait\'){emit(doc.request.'
                        +'url,[doc._rev,doc.ts_created])}}'
                }
              , 'timestamp':{
                    'map':'function(doc){if(doc.ts_modified){emit(null,doc.ts_m'
                        +'odified)}}'
                  , 'reduce':'function(keys,values,rereduce){if(rereduce){retur'
                        +'n{\'min\':values.reduce(function(a,b){return Math.min'
                        +'(a,b.min)},Infinity),\'max\':values.reduce(function(a'
                        +',b){return Math.max(a,b.max)},-Infinity),\'count\':va'
                        +'lues.reduce(function(a,b){return a+b.count},0)}}else{'
                        +'return{\'min\':Math.min.apply(null,values),\'max\':Ma'
                        +'th.max.apply(null,values),\'count\':values.length}}}'
                }
              , 'mimetype':{
                    'map':'function(doc){if(doc._id.substring(0,4)==\'file\'){e'
                        +'mit(doc.mimetype,null);}}'
                  , 'reduce':'_count'
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

