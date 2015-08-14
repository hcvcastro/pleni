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
                        +'est\'){if(req.query.a==1&&doc.request.method!=\'GET\''
                        +'){return false;}if(req.query.b==1&&doc.request.method'
                        +'!=\'HEAD\'){return false;}if(req.query.c==1&&doc.requ'
                        +'est.method!=\'POST\'){return false;}if(req.query.d==1'
                        +'&&doc.request.method!=\'PUT\'){return false;}if(req.q'
                        +'uery.e==1&&doc.request.method!=\'DELETE\'){return fal'
                        +'se;}if(req.query.f==1&&doc.request.method!=\'TRACE\')'
                        +'{return false;}if(req.query.g==1&&doc.request.method!'
                        +'=\'OPTIONS\'){return false;}if(req.query.h==1&&doc.re'
                        +'quest.method!=\'CONNECT\'){return false;}if(req.query'
                        +'.i==1&&doc.request.method!=\'TRACE\'){return false;}i'
                        +'f(req.query.j==1&&Math.floor(doc.response.status/100)'
                        +'!=2){return false;}if(req.query.k==1&&Math.floor(doc.'
                        +'response.status/100)!=3){return false;}if(req.query.l'
                        +'==1&&Math.floor(doc.response.status/100)!=4){return f'
                        +'alse;}if(req.query.m==1&&Math.floor(doc.response.stat'
                        +'us/100)!=5){return false;}if(req.query.n==1&&doc.stat'
                        +'us!=\'wait\'){return false;}if(req.query.o==1&&doc.st'
                        +'atus!=\'lock\'){return false;}if(req.query.p==1&&doc.'
                        +'status!=\'complete\'){return false;}return true;}else'
                        +'{return false;}}'
            }
          , 'views':{
                'wait':{
                    'map':'function(doc){if(doc._id.substring(0,7)==\'request\''
                        +'&&doc.status&&doc.status==\'wait\'){emit(doc.request.'
                        +'url,[doc._rev,doc.ts_created])}}'
                }
              , 'timestamp':{
                    'map':'function(doc){if(doc.ts_modified){emit(null,doc.ts_m'
                        +'odified)}}',
                    'reduce':'function(keys,values,rereduce){if(rereduce){retur'
                        +'n{\'min\':values.reduce(function(a,b){return Math.min'
                        +'(a,b.min)},Infinity),\'max\':values.reduce(function(a'
                        +',b){return Math.max(a,b.max)},-Infinity),\'count\':va'
                        +'lues.reduce(function(a,b){return a+b.count},0)}}else{'
                        +'return{\'min\':Math.min.apply(null,values),\'max\':Ma'
                        +'th.max.apply(null,values),\'count\':values.length}}}'
                }
              , 'requests':{
                    'map':'function(doc){if(doc._id.substring(0,7)==\'request\''
                        +'){var p={status:doc.status,ts_created:doc.ts_created,'
                        +'ts_modified:doc.ts_modified,request:{method:doc._id.s'
                        +'plit(\'::\')[2],url:doc.request.url}};if(doc.response'
                        +'){p.response={status:doc.response.status};}emit(doc.t'
                        +'s_modified,p);}}'
                }
              , 'pages':{
                    'map':'function(doc){if(doc._id.substring(0,4)==\'page\'){v'
                        +'ar p={ts_created:doc.ts_created,ts_modified:doc.ts_mo'
                        +'dified,};emit(doc.ts_modified,p);}}'
                }
              , 'files':{
                    'map':'function(doc){if(doc._id.substring(0,4)==\'file\'){v'
                        +'ar p={status:doc.status,ts_created:doc.ts_created,ts_'
                        +'modified:doc.ts_modified,filesize:doc.filesize,mimety'
                        +'pe:doc.mimetype};emit(doc.ts_modified,p);}}'
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

