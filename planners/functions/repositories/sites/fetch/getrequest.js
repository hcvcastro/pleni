'use strict';

var request=require('request')
  , Q=require('q')
  , sha1=require('sha1')
  , md5=require('MD5')

/*
 * Function for make a HTTP GET request to url
 * args inputs
 *      task
 *          wait
 *              id
 *              key
 *              value
 *          head
 *              status
 *              headers
 *              get
 *      headers(*)
 *      
 * args outputs
 *      task
 *          get
 *              status
 *              headers
 *              body
 *              sha1
 *              md5
 */
exports.getrequest=function(args){
    var deferred=Q.defer()
      , url=args.task.wait.key+args.task.wait.id.substr(5)
      , headers={}

    if(args.headers){
        headers=args.headers;
    }

    if(!args.task.head.get){
        deferred.resolve(args);
    }else{
        request.get({url:url,headers:headers},function(error,response){
            if(!error){
                var r_headers=response.headers
                  , r_body=response.body

                args.task.get={
                    'status':response.statusCode
                  , 'headers':r_headers
                  , 'body':r_body
                  , 'sha1':sha1(r_body)
                  , 'md5':md5(r_body)
                }
                deferred.resolve(args);
                return;
            }
            deferred.reject(error);
        });
    }

    return deferred.promise;
};
