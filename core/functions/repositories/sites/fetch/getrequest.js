'use strict';

var request=require('request')
  , Q=require('q')
  , sha1=require('sha1')
  , md5=require('MD5')

/*
 * Function for make a HTTP GET request to url
 * args input
 *      task
 *          wait
 *              url
 *          head
 *              headers
 *      headers(*)
 *      
 * args output
 *      task
 *          get
 *              status
 *              headers
 *              body
 *              sha1
 *              md5
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
        console.log('make a GET request ... '+url);
    }

    if(/text\/html/i.test(args.task.head.headers['content-type'])){
        request({
            method:'GET'
          , url:url
          , headers:headers
          , followRedirect:false
        },function(error,response){
            if(!error){
                args.task.get={
                    'status':response.statusCode
                  , 'headers':response.headers
                  , 'body':response.body
                  , 'sha1':sha1(response.body)
                  , 'md5':md5(response.body)
                };

                deferred.resolve(args);
            }else{
                deferred.reject(error);
            }
        });
    }else{
        deferred.resolve(args);
    }

    return deferred.promise;
};

