'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for get a document in wait status
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *
 * args output
 *      task
 *          wait
 *              id
 *              key
 *              value
 */
module.exports=function(args){
    var deferred=Q.defer()
      , view='/_design/sites/_view/wait'
      , buffer=16
      , url=args.db.host+'/'+args.db.name+view+'?limit='+buffer
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    if(args.debug){
        console.log('get a wait document ... ');
    }
    request.get({url:url,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                var json=JSON.parse(response.body);
                if(json.total_rows!=0){
                    var max=Math.min(json.total_rows,buffer)
                      , index=Math.floor(Math.random()*(max));

                    if(!args.task){
                        args.task={};
                    }
                    args.task.wait=json.rows[index];
                    deferred.resolve(args);
                }else{
                    deferred.reject({"complete":true});
                }
            }else{
                deferred.reject(response.body);
            }
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

