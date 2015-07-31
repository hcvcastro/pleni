'use strict';

var request=require('request')
  , Q=require('q')
  , _url=require('url')
  , validator=require('../../../../validators')

/*
 * Function for propagate rels in site repository
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *      task
 *          wait
 *              url
 *          response
 *              headers
 *          rels
 *
 * args output
 *      task
 *          spread
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name+'/'
      , document=args.task.wait.id.split('::')
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , valid_headers=[
            /text\/html/i
          , /application\/javascript/i
          , /text\/css/i
        ]
      , valid_contenttype=valid_headers.some(function(element){
            return element.test(args.task.response.headers['content-type']);
        });

    if(args.debug){
        console.log('spreading site relations');
    }

    switch(document[2]){
        case 'HEAD':
            if(valid_contenttype){
                var ts=Date.now()
                  , doc=['page',ts,'GET',encodeURIComponent(document[3])]

                request.put({
                    url:url+doc.join('::')
                  , headers:headers
                  , json:{
                        status:'wait'
                      , ts_created:ts
                      , ts_modified:ts
                      , request:{
                            url:args.task.wait.url
                        }
                    }
                },function(error,response){
                    if(!error){
                        args.task.spread=[];
                        deferred.resolve(args);
                    }else{
                        deferred.reject(error);
                    }
                });
            }
            break;
        case 'GET':
            console.log('spreadrels');
            if('location' in args.task.response.headers){
                
            }
            if('refresh' in args.task.response.headers){

            }

            if(args.task.rels){
                Q.all(args.task.rels.filter(function(item){
                    return validator.validHost(item.url);
                }).map(function(item){
                    var deferred2=Q.defer()
                      , parse=_url.parse(item.url)
                      , ts=Date.now()
                      , doc=['page',ts,'HEAD'
                            ,encodeURIComponent(parse.pathname)]

                    request.put({
                        url:url+doc.join('::')
                      , headers:headers
                      , json:{
                            status:'wait'
                          , ts_created:ts
                          , ts_modified:ts
                          , request:{
                                url:item.url
                            }
                        }
                    },function(error,response){
                        if(!error){
                            deferred2.resolve(item.url);
                        }else{
                            deferred2.reject({});
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
                        console.log('spread links found: '+spread.join(' '));
                    }
         
                    args.task.spread=spread;
                    deferred.resolve(args);
                });
            }else{
                deferred.resolve(args);
            }
            break;
    }

    return deferred.promise;
};

