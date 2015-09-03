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
 *              id
 *              url
 *          response
 *              headers
 *          rels
 *      site
 *          list
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
      , spread=function(packet){
            var deferred2=Q.defer()
              , parse=_url.parse(packet.url)
              , ts=Date.now()
              , page=parse.pathname
              , document=['request',ts,'HEAD',page].join('::')
              , url=args.db.host+'/'+args.db.name+'/'+document

            if(!(page in packet.dict)){
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
                deferred2.resolve(packet);
            }

            return deferred2.promise;
        }

    if(args.debug){
        console.log('spreading page relations');
    }

    if(args.task.rels&&args.task.rels.length>0){
        var list={}
          , _rels=[]
          , rels=uniq(args.task.rels.map(function(i){
                    return i.url;
                }).filter(function(i){
                    return validator.validHost(i);
                }))
          , exists=args.site.list.map(function(i){
                    return i.id.split('::')[3];
                })
          , dict={}

        rels.forEach(function(url){
            var parse=_url.parse(url);
            if(!(parse.pathname in list)){
                list[parse.pathname]=url;
            }
        });

        for(var i in list){
            _rels.push(list[i]);
        }

        dict[args.task.wait.id.split('::')[3]]=true;
        exists.forEach(function(i){
            dict[i]=true;
        });

        Q.all(_rels.map(function(item){
            return spread({dict:dict,url:item});
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
        args.task.spread=[];
        deferred.resolve(args);
    }

    return deferred.promise;
};

