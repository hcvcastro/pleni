'use strict';

var request=require('request')
  , Q=require('q')

/*
 * args definition
 *      host
 *      dbname
 *      cookie <- getting from auth
 *      site_type
 *      site_url
 */
exports.getsitetask=function(args){
    var deferred=Q.defer()
      , view='/_design/default/_view/wait
      , url=args.host+'/'+args.dbname+args.view+'?limit=1'
      , headers={
            'Cookie':args.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    request.put({url:url,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                var json=JSON.parse(response.body);
                if(json.total_rows!=0){
                    var row=json.rows[0];
                }
            }
            deferred.reject(response.body);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

/*
  , look:function(args){
        var deferred=Q.defer()
          , doc='/'+encodeURIComponent(args[1].id)
          , url=args[0].host+args[0].dbname+doc
          , body={
                _rev:args[1].value
              , site:args[1].key
              , status:'lock'
              , type:'page'
              , timestamp:Date.now()
        };

        console.log('->  '+url);
        request.put({url:url,json:body},function(error,response,body){
            if(!error&&response.statusCode==201){
                if(body.ok){
                    deferred.resolve(args.concat(body));
                    return;
                }
            }
            deferred.reject(error);
        });

        return deferred.promise;
    }
  , headers:function(args){
        var deferred=Q.defer()
          , site=args[1].key+args[1].id.substr(5);

        console.log('    -> '+site);
        request.head({url:site},function(error,response,body){
            if(!error){
                var headers=response.headers
                  , body=false;

                // header analysis (TODO)
                if (headers['content-type'] == 'text/html') {
                    body=true;
                }

                deferred.resolve(args.concat({
                    request:site
                  , status:response.statusCode
                  , headers:headers
                  , fetchbody:body
                }));
            }
            deferred.reject(error);
        });

        return deferred.promise;
    }
  , fetch:function(args){
        var deferred=Q.defer();

        if(!args[3].fetchbody){
            deferred.resolve(args.concat({}));
        }else{
            request.get({url:args[3].request},function(error,response){
                deferred.resolve(args.concat({
                    status:response.statusCode
                  , headers:response.headers
                  , body:response.body
                }));
            });
        }

        return deferred.promise;
    }
  , scrap:function(args){
        var deferred=Q.defer();

        if(!args[3].fetchbody){
            deferred.resolve(args.concat({}));
        }else{
            var $=cheerio.load(args[4].body)
              , links={script:[],link:[],a:[],img:[]}
              , prop=[]
              , register_link=function(link, haystack){
                    var result={orig:link,type:'?'}
                      , link2=link;

                    if(link==undefined){
                        return;
                    }

                    if(/^[a-z]*:\/\/.*---/i.test(link)){
                        var sub=link.slice(0,args[1].key.length);
                        if(sub==args[1].key){
                            link2=link.substr(sub.length);
                        }else{
                            result.type='remote';
                        }
                    }
                    
                    if(result.type=='?'){
                        if(link2.slice(0,1)=='/'){
                            result.type='absolute';
                            result.clean=link2;
                        }else{
                            result.type='relative';
                            var anchor=args[3].request
                              , i=anchor.lastIndexOf('/')
                              , base=anchor.substr(0,i+1)
                              , path=base.substr(args[1].key.length);

                            result.clean=path+link2;
                        }
                        prop.push(result.clean);
                    }

                    haystack.push(result);
                };

            // body analysis (TODO)
            $('script').each(function(i,element){
                register_link($(this).attr('src'),links.script);
            });
            $('link').each(function(i,element){
                register_link($(this).attr('href'),links.link);
            });
            $('a').each(function(i,element){
                register_link($(this).attr('href'),links.a);
            });
            $('img').each(function(i,element){
                register_link($(this).attr('src'),links.img);
            });

            deferred.resolve(args.concat({links:links,prop:prop}));
        }
        return deferred.promise;
    }
  , register:function(args){
        var deferred=Q.defer()
          , doc='/'+encodeURIComponent(args[1].id)
          , url=args[0].host+args[0].dbname+doc
          , body={
                _rev:args[2].rev
              , site:args[1].key
              , status:'complete'
              , type:'page'
              , timestamp:Date.now()
              , head:{
                    status: args[3].status
                  , headers: args[3].headers
                }
            };

        if(args[3].fetchbody){
            body.get={
                status: args[4].status
              , headers: args[4].headers
              , body: args[4].body
            };
            body.links=args[5].links;
        }

        request.put({url:url,json:body},function(error,response,body){
            if(!error&&response.statusCode==201){
                if(body.ok){
                    deferred.resolve(args);
                    return;
                }
            }
            deferred.reject(error);
        });

        return deferred.promise;
    }
  , spread:function(args){
        var deferred=Q.defer()
          , url=args[0].host+args[0].dbname;

        if(args[5].prop){
            args[5].prop.forEach(function(element){
                var doc='/page_'+encodeURIComponent(element)
                  , body={
                        site:args[1].key
                      , status:'wait'
                      , type:'page'
                      , timestamp:Date.now()
                };

                request.put({url:url+doc,json:body},function(error,response,body){
                    if(!error){
                        console.log('        -> '
                            +response.statusCode+' '+element);
                    }
                });
            });
        }

        return deferred.promise;
    
  }
*/

