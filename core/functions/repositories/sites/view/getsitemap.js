'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for getting the map site schema in a site repository
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *
 * args output
 *      site
 *          sitemap
 */
module.exports=function(args){
    var deferred=Q.defer()
      , view='/_design/sites/_view/sitemap'
      , url=args.db.host+'/'+args.db.name+view
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    if(args.debug){
        console.log('get a sitemap document');
    }
    request.get({url:url,headers:headers},function(error,response){
        if(!error){
            if(!args.site){
                args.site={};
            }

            var parse=JSON.parse(response.body)
              , dict={}
              , nodes=new Array()
              , links=new Array()
              , count=0

            if(parse.rows){
                for(var i=0;i<parse.rows.length;i++){
                    dict[parse.rows[i].key]=i;
                }

                nodes=parse.rows.map(function(node){
                    if(!node.value||Object.keys(node.value).length==0){
                        return {
                            page:node.key
                          , status:'unknown'
                          , mime:'unknown'
                          , get:false
                          , type:'unknown'
                        };
                    }else{
                        count++;
                        node.value.rel.forEach(function(link){
                            links.push({
                                source:dict[node.key]
                              , target:dict[link]
                            })
                        });
                        return {
                            page:node.key
                          , status:node.value.status
                          , mime:node.value.mime
                          , get:node.value.get
                          , type:node.value.type
                        };
                    }
                });

                args.site.sitemap={
                    count:count
                  , total:parse.total_rows
                  , nodes:nodes
                  , links:links
                };
                deferred.resolve(args);
            }else{
                deferred.reject({error:'Not valid site repository'});
            }
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};
