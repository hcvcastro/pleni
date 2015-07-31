'use strict';

var request=require('request')
  , Q=require('q')
  , _url=require('url')
  , sha1=require('sha1')
  , md5=require('MD5')

/*
 * Function for make a HTTP request to url
 * args input
 *      task
 *          wait
 *              id
 *              url
 *      headers(*)
 *      
 * args output
 *      task
 *          response
 *              status
 *              headers
 *              body
 *              sha1
 *              md5
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.task.wait.url
      , document=args.task.wait.id.split('::')
      , method=document[2]
      , headers={}

    if(args.headers){
        args.headers.forEach(function(header){
            headers[header.name]=header.value;
        });
    }

    if(args.debug){
        console.log('make a '+method+' request ... '+url);
    }

    request({
        method:method
      , url:url
      , headers:headers
      , followRedirect:false
    },function(error,response){
        if(!error){
            args.task.response={
                'status':response.statusCode
              , 'headers':response.headers
            };

            if(response.body){
                args.task.response['body']=response.body;
                args.task.response['sha1']=sha1(response.body);
                args.task.response['md5']=md5(response.body);
            }

            deferred.resolve(args);
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

