'use strict';

var uniq=require('underscore').uniq
  , request=require('request')
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
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , check1=function(packet){
            var deferred2=Q.defer()
              , parse=_url.parse(packet.url)
              , page=encodeURIComponent(parse.pathname)
              , url=args.db.host+'/'+args.db.name+'/page%3A%3A'+page

            request.head({url:url,headers:headers},function(error,response){
                if(!error&&response.statusCode==200){
                    packet.check=true;
                }else{
                    packet.check=false;
                }

                deferred2.resolve(packet);
            });

            return deferred2.promise;
        }
      , check2=function(packet){
            var deferred2=Q.defer()

            if(packet.check===false){
                var parse=_url.parse(packet.url)
                  , page=encodeURIComponent(parse.pathname)
                  , url=args.db.host+'/'+args.db.name+'/file%3A%3A'+page

                request.head({url:url,headers:headers},function(error,response){
                    if(!error&&response.statusCode==200){
                        packet.check=true;
                    }else{
                        packet.check=false;
                    }

                    deferred2.resolve(packet);
                });
            }else{
                deferred2.resolve(packet);
            }

            return deferred2.promise;
        }
      , spread=function(packet){
            var deferred2=Q.defer()
              , parse=_url.parse(packet.url)
              , ts=Date.now()
              , page=encodeURIComponent(parse.pathname)
              , document=['request',ts,'HEAD',page].join('%3A%3A')
              , url=args.db.host+'/'+args.db.name+'/'+document

            if(packet.check===false){
                request.put({
                    url:url
                  , headers:headers
                  , json:{
                        status:'wait'
                      , ts_created:ts
                      , ts_modified:ts
                      , request:{
                            url:packet.url
                          , method:'HEAD'
                        }
                    }
                },function(error,response){
                    if(!error){
                        packet.create=true;
                    }else{
                        packet.create=false;
                    }

                    deferred2.resolve(packet);
                });
            }else{
                packet.create=false;
                deferred2.resolve(packet);
            }

            return deferred2.promise;
        }

    if(args.debug){
        console.log('spreading page relations');
    }

    if(args.task.rels){
        var list={}
          , _rels=[]
          , rels=uniq(args.task.rels.map(function(i){
                    return i.url;
                }).filter(function(i){
                    return validator.validHost(i);
                }))

        rels.forEach(function(url){
            var parse=_url.parse(url);
            if(!(parse.pathname in list)){
                list[parse.pathname]=url;
            }
        });

        for(var i in list){
            _rels.push(list[i]);
        }

        Q.all(_rels.map(function(item){
            return check1({url:item}).then(check2).then(spread);
        }))
        .spread(function(){
            var list=[]

            for(var i in arguments){
                list.push(arguments[i]);
            }

            list=list.filter(function(item){
                return item.create==true;
            }).map(function(item){
                return item.url;
            });

            if(args.debug){
                console.log('spread links found: '+list.length);
            }
 
            args.task.spread=list;
            deferred.resolve(args);
        });
    }else{
        deferred.resolve(args);
    }

    return deferred.promise;
};

