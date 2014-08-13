'use strict';

var request=require('request')
  , Q=require('q')
  , sha1=require('sha1')
  , md5=require('MD5')
  , cheerio=require('cheerio')
  , _url=require('url')
  , _path=require('path')

/*
 * args definition
 *      host
 *      dbname
 *      cookie <- getting from auth
 */
exports.getsitetask=function(args){
    var deferred=Q.defer()
      , view='/_design/default/_view/wait'
      , url=args.host+'/'+args.dbname+view+'?limit=1'
      , headers={
            'Cookie':args.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    request.get({url:url,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                var json=JSON.parse(response.body);
                if(json.total_rows!=0){
                    args['wait_task']=json.rows[0];
                    deferred.resolve(args);
                    return;
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
 * args definition
 *      host
 *      dbname
 *      cookie
 *      wait_task <- {id,key,value} <- from mapreduce in couchdb
 */
exports.looksitetask=function(args){
    var deferred=Q.defer()
      , doc='/'+encodeURIComponent(args['wait_task'].id)
      , url=args.host+'/'+args.dbname+doc
      , headers={
            'Cookie':args.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            _rev:args['wait_task'].value
          , url:args['wait_task'].key
          , status:'look'
          , type:'page'
          , timestamp:Date.now()
        }

    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(response.statusCode==201){
                if(response.body.ok){
                    args['look_task']=response.body;
                    deferred.resolve(args);
                    return;
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
 * args definition
 *      wait_task   <- {id,key,value} <- from mapreduce in couchdb
 * optionally:
 *      req_headers <- customized headers for request
 *      agent       <- user agent for request
 */
exports.getheadrequest=function(args){
    var deferred=Q.defer()
      , url=args['wait_task'].key+args['wait_task'].id.substr(5)
      , headers={}

    if(args.req_headers){
        headers=args.req_headers;
    }else if(args.agent){
        headers={'User-Agent':args.agent}
    }

    request.head({url:url,headers:headers},function(error,response){
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

            args['request_head']={
                'status':response.statusCode
              , 'headers':r_headers
              , 'get':r_body
            }
            deferred.resolve(args);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

/*
 * args definition
 *      request_head <- {status,headers,get}
 *      wait_task    <- {id,key,value} <- from mapreduce in couchdb
 * optionally:
 *      req_headers <- customized headers for request
 *      agent       <- user agent for request
 */
exports.getgetrequest=function(args){
    var deferred=Q.defer()
      , url=args['wait_task'].key+args['wait_task'].id.substr(5)
      , headers={}

    if(args.req_headers){
        headers=args.req_headers;
    }else if(args.agent){
        headers={'User-Agent':args.agent}
    }

    if(!args['request_head'].get){
        deferred.resolve(args);
    }else{
        request.get({url:url,headers:headers},function(error,response){
            if(!error){
                var r_headers=response.headers
                  , r_body=response.body

                args['request_get']={
                    'status':response.statusCode
                  , 'headers':r_headers
                  , 'body':r_body
                  , 'sha1':sha1(r_body)
                  , 'md5':md5(r_body)
                }
                deferred.resolve(args);
                return;
            }
            deferred.reject(error);
        });
    }

    return deferred.promise;
};

/*
 * args definition
 *      wait_task    <- {id,key,value} <- from mapreduce in couchdb
 *      request_head <- {status,headers,get}
 *      request_get  <- {status,headers,body,sha1,md5}
 */
exports.bodyanalyzerlinks=function(args){
    var deferred=Q.defer()

    if(!args['request_head'].get){
        deferred.resolve(args);
        return deferred.promise;
    }

    var origin=args['wait_task'].key
      , url=args['wait_task'].key+args['wait_task'].id.substr(5)
      , $=cheerio.load(args['request_get'].body)
      , links={script:[],link:[],a:[],img:[],form:[]}
      , samedomain=[];

    function register_link(link,haystack){
        var _p=_url.parse(link);
        var result={orig:link,type:'?'}
          , link2=link

        if(link==undefined){
            return;
        }

        if(/^[a-z]*:\/\/.*/i.test(link)){
            var sub=link.slice(0,origin.length);
            if(sub==origin){
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
                var anchor=url
                  , i=anchor.lastIndexOf('/')
                  , base=anchor.substr(0,i+1)
                  , path=base.substr(origin.length);

                result.clean=path+link2;
            }
            samedomain.push(result.clean);
        }

        haystack.push(result);
    }

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
    $('form').each(function(i,element){
        register_link($(this).attr('action'),links.form);
    });

    args['body_links']=links;
    args['body_related']=samedomain;
    deferred.resolve(args);

    return deferred.promise;
};

/*
 * args definition
 *      host
 *      dbname
 *      cookie
 *      agent
 *      wait_task <- {id,key,value}
 *      look_task <- {ok,id,rev}
 */
exports.completesitetask=function(args){
    var deferred=Q.defer()
      , doc='/'+encodeURIComponent(args['look_task'].id)
      , url=args.host+'/'+args.dbname+doc
      , headers={
            'Cookie':args.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }
      , body={
            _rev:args['look_task'].rev
          , url:args['wait_task'].key
          , status:'complete'
          , type:'page'
          , timestamp:Date.now()
        }

    body['agent']=args['agent'];
    body['request_head']=args['request_head'];

    if(args['request_head'].get){
        body['request_get']=args['request_get'];
        body['links']=args['body_links'];
    }

    request.put({url:url,headers:headers,json:body},function(error,response){
        if(!error){
            if(response.statusCode==201){
                if(response.body.ok){
                    args['complete_task']=response.body;
                    deferred.resolve(args);
                    return;
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
 * args definition
 *      host
 *      dbname
 *      body_related <- Array <- from body analyzer function
 *      wait_task    <- {id,key,value}
 */
exports.spreadsitelinks=function(args){
    var deferred=Q.defer()
      , url=args.host+'/'+args.dbname
      , documents=[]

    if(args['body_related']){
        args['body_related'].forEach(function(element){
            var doc='/page_'+encodeURIComponent(element)
              , document={
                    status:'wait'
                  , url:args['wait_task'].key
                  , type:'page'
                  , timestamp:Date.now()
            };

            request.put({url:url+doc,json:document},function(error,response){
                if(!error){
                    documents.push(element);
                }
            });
        });

        deferred.resolve(args);
    }

    return deferred.promise;
};

