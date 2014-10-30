'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for make a HTTP HEAD request to url
 * args inputs
 *      task
 *          wait
 *              id
 *              key
 *              value
 *      headers(*)
 *
 * args outputs
 *      task
 *          head
 *              status
 *              headers
 *              get
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.task.wait.key+args.task.wait.id.substr(5)
      , headers={}

    if(args.headers){
        headers=args.headers;
    }

    request.head({url:url,headers:headers},function(error,response){
        if(!error){
            var r_headers=response.headers
              , valid_headers=[
                    /text\/html/i
                  , /application\/javascript/i
                  , /text\/css/i
                ]
              , r_body=valid_headers.some(function(element){
                    return element.test(r_headers['content-type']);
                })

            args.task.head={
                'status':response.statusCode
              , 'headers':r_headers
              , 'get':r_body
            }
            deferred.resolve(args);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

