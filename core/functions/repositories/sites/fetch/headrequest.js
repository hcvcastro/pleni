'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for make a HTTP HEAD request to url
 * args input
 *      task
 *          wait
 *              url
 *      headers(*)
 *
 * args output
 *      task
 *          head
 *              status
 *              headers
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.task.wait.url
      , headers={}

    if(args.headers){
        args.headers.forEach(function(header){
            headers[header.name]=header.value;
        });
    }

    if(args.debug){
        console.log('make a HEAD request ... '+url);
    }

    request({
        method:'HEAD'
      , url:url
      , headers:headers
      , followRedirect:false
    },function(error,response){
        if(!error){
            args.task.head={
                'status':response.statusCode
              , 'headers':response.headers
            };

            deferred.resolve(args);
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

