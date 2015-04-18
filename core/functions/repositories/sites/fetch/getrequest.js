'use strict';

var request=require('request')
  , Q=require('q')
  , _url=require('url')
  , sha1=require('sha1')
  , md5=require('MD5')

/*
 * Function for make a HTTP GET request to url
 * args input
 *      task
 *          wait
 *              id
 *              url
 *          head
 *              status
 *              headers
 *              get
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
      , url=_url.resolve(args.task.wait.url,args.task.wait.id.substr(5))
      , headers={}

    if(args.headers){
        args.headers.forEach(function(header){
            headers[header.name]=header.value;
        });
    }

    if(!args.task.head.get){
        deferred.resolve(args);
    }else{
        if(args.debug){
            console.log('make a GET request ... '+url);
        }
        request.get({
            url:url
          , headers:headers
          , followRedirect:false
        },function(error,response){
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
            }else{
                deferred.reject(error);
            }
        });
    }

    return deferred.promise;
};

