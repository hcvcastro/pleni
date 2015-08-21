'use strict';

var request=require('request')
  , Q=require('q')
  , _url=require('url')

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
 *              count
 *              total
 *              nodes
 *              links
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
              , count=0
              , nodes=new Array()
              , links=new Array()

            if(parse.rows){
                parse.rows.forEach(function(item){
                    var node={
                            page:item.key
                          , status:item.value.status
                          , statuscode:item.value.statuscode
                          , mimetype:item.value.mimetype
                          , type:item.value.type
                        }

                    if(item.key in dict){
                        nodes[dict[item.key]]=node;
                    }else{
                        dict[item.key]=count;
                        nodes.push(node);
                        count++;
                    }

                    item.value.rels.forEach(function(rel){
                        var urlparse=_url.parse(rel)
                          , page=urlparse.pathname

                        if(!(page in dict)){
                            dict[page]=count;
                            nodes.push({
                                page:page
                              , status:'pending'
                              , statuscode:'unknown'
                              , mimetype:'unknown'
                              , type:'unknown'
                            });
                            count++;
                        }

                        links.push({
                            source:dict[item.key]
                          , target:dict[page]
                        });
                    });
                });

                args.site.sitemap={
                    count:parse.total_rows
                  , total:nodes.length
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

