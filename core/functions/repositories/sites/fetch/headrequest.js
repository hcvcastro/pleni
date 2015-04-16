'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for make a HTTP HEAD request to url
 * args input
 *      task
 *          wait
 *              id
 *              url
 *      headers(*)
 *
 * args output
 *      task
 *          head
 *              status
 *              headers
 *              get
 *              location (*)
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.task.wait.url+args.task.wait.id.substr(5)
      , headers={}

    if(args.headers){
        console.log(args.headers);
        args.headers.forEach(function(header){
            headers[header.name]=header.value;
        });
    }

    if(args.debug){
        console.log('make a HEAD request ... '+url);
    }
    request.head({
        url:url
      , headers:headers
      , followRedirect:false
    },function(error,response){
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
              , status=Math.floor(response.statusCode/100)
              , s_body=(status==2)
              , head={
                    'status':response.statusCode
                  , 'headers':r_headers
                  , 'get':(r_body & s_body)
                }

            if(status==3){
                head.location=r_headers['location'];
            }

            args.task.head=head;
            deferred.resolve(args);
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

