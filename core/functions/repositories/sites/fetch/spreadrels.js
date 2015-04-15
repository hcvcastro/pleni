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

    if(args.task&&args.task.rels){
        Q.all(args.task.rels.map(function(element){
            var deferred2=Q.defer()
              , parse=_url.parse(element.url)
              , doc='/page_'+encodeURIComponent(parse.pathname)

            if(validator.validHost(element.url)){
                request.put({url:url+doc,json:body},function(error,response){
                    if(!error){
                        deferred2.resolve(element.url);
                   }else{
                       deferred2.reject({});
                   }
               });
            }else{
                deferred2.reject({});
            }
            return deferred2.promise;
        }))
        .spread(function(){
            var spread=new Array();
            for(var i in arguments){
                spread.push(arguments[i]);
            }

            if(args.debug){
                console.log('spread the founded links: '+spread.join(' '));
            }

            args.task.spread=spread;
            deferred.resolve(args);
        });
    }else{
        deferred.resolve(args);
    }

    return deferred.promise;
};

