'use strict';

var request=require('request')
  , Q=require('q')
  , validator=require('../../../../utils/validators')

/*
 * Function for propagate refs in site repository
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *      task
 *          wait
 *              id
 *              key
 *              value
 *          ref
 *              related
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
          , url:validator.toValidHost(args.task.wait.key)
          , timestamp:Date.now()
        }

    if(args.task && args.task.ref && args.task.ref.related){
        Q.all(args.task.ref.related.map(function(element){
            var deferred2=Q.defer()
              , doc='/page_'+encodeURIComponent(element)

            request.put({url:url+doc,json:body},function(error,response){
                if(!error){
                    deferred2.resolve(element);
               }else{
                   deferred2.reject(error);
               }
           });
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

