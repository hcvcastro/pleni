'use strict';

var request=require('request')
  , Q=require('q')
  , _url=require('url')

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
      , url=_url.resolve(args.task.wait.url,args.task.wait.id.substr(5))
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
                var path=_url.resolve(url,head.location)
                  , _h1=_url.parse(url)
                  , _h2=_url.parse(path)
console.log('pre host');
console.log(url,path);
                if(_h1.host===_h2.host){
console.log('pre path');
console.log(_h1.host,_h2.host);
                    if(_h1.pathname==_h2.pathname){
                        head.get=true
                    }else{
console.log(_h1.pathname,_h2.pathname);
                        args.task.rels=[{
                            tag:'header'
                          , url:path
                        }]
                    }
                }else{
                    args.task.refs=[{
                        tag:'header'
                      , url:path
                    }]
                }
            }

            args.task.head=head;
            deferred.resolve(args);
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

