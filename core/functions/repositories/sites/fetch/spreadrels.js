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
              , ts=Date.now()
              , page=packet.page
              , escape=args.db.host.substr(-9)!='/dbserver'

            if(escape){
                page=page.replace(/\//g,'%2F');
            }

            var document=['request',ts,'HEAD',page].join('::')
              , url=args.db.host+'/'+args.db.name+'/'+document

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

            return deferred2.promise;
        }

    if(args.task.rels&&args.task.rels.length>0){
        var exists={}
          , _exists=args.site.list.map(function(i){
                    return i.id.split('::')[3];
                }).forEach(function(j){
                    exists[j]=true;
                })

        exists[args.task.wait.id.split('::')[3]]=true;

        var rels=[]
          , _rels=uniq(args.task.rels.map(function(i){
                    return i.url;
                }).filter(function(j){
                    return validator.validHost(j);
                })).forEach(function(k){
                    var parse=_url.parse(k);
                    if(!(parse.pathname in exists)){
                        rels.push({
                            page:parse.pathname
                          , url:k
                        });
                    }
                })

        if(args.debug){
            console.log('spreading page relations:');
            console.log(JSON.stringify(rels.map(function(i){
                return i.page;
            })));
        }

        Q.all(rels.map(function(item){
            return spread(item);
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

