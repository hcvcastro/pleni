'use strict';

var request=require('request')
  , Q=require('q')
  , _url=require('url')
  , validator=require('../../../../validators')

/*
 * Function for propagate rels in site repository
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *      task
 *          wait
 *              url
 *          rels
 *
 * args output
 *      task
 *          spread
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            status:'wait'
          , type:'page'
          , url:validator.toValidHost(args.task.wait.url)
          , ts_created:Date.now()
          , ts_modified:Date.now()
        }

    if(args.debug){
        console.log('spreading site relations');
    }

    if(args.task&&args.task.rels){
        Q.all(args.task.rels.filter(function(item){
            return validator.validHost(item.url);
        }).map(function(item){
            var deferred2=Q.defer()
              , parse=_url.parse(item.url)
              , doc='/page_'+encodeURIComponent(parse.pathname)

            deferred2.resolve(1);
console.log(item.url);
            return deferred2.promise;
        }))
        .spread(function(args){
console.log('spread');
console.log(args);
            args.task.spread=[];
            deferred.resolve(args);
        });
    }else{
        deferred.resolve(args);
    }

    return deferred.promise;
};

//
//           request.put({url:url+doc,json:body},function(error,response){
//               if(!error){
//                   deferred2.resolve(element.url);
//               }else{
//                   deferred2.reject({});
//               }
//           });

//           var spread=new Array();
//           for(var i in arguments){
//               spread.push(arguments[i]);
//           }
//
//           if(args.debug){
//               console.log('spread the founded links: '+spread.join(' '));
//           }
//
//           args.task.spread=spread;
