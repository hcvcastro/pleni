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
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , check=function(packet){
            var deferred2=Q.defer()
              , parse=_url.parse(packet.url)
              , page=encodeURIComponent(parse.pathname)
              , url=args.db.host+'/'+args.db.name+'/page::'+page

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
      , spread=function(packet){
            var deferred2=Q.defer()
              , parse=_url.parse(packet.url)
              , ts=Date.now()
              , page=encodeURIComponent(parse.pathname)
              , document=['request',ts,'HEAD',page].join('::')
              , url=args.db.host+'/'+args.db.name+'/'+document

            if(!packet.check){
                request.put({
                    url:url
                  , headers:headers
                  , json:{
                        status:'wait'
                      , ts_created:ts
                      , ts_modified:ts
                      , request:{
                            url:packet.url
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
        Q.all(args.task.rels.filter(function(item){
            return validator.validHost(item.url);
        }).map(function(item){
            return check({url:item.url}).then(spread);
        }))
        .spread(function(){
            var list=[];

            for(var i in arguments){
                list.push(arguments[i]);
            }

            list=list.filter(function(item){
                return item.create==true;
            }).map(function(item){
                return item.url;
            });

            if(args.debug){
                console.log('spread links found: '+list.join(' '));
            }
 
            args.task.spread=list;
            deferred.resolve(args);
        });
    }else{
        deferred.resolve(args);
    }

    return deferred.promise;
};

