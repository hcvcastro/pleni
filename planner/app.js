'use strict';

var express=require('express')
  , bodyparser=require('body-parser')
  , http=require('http')
  , request=require('request')
  , Q=require('q')
  , cheerio=require('cheerio')
  , app=express();

var planner={
    interval: 3000
  , run:function(){
        console.log('Run ... '+Date.now());
        this.stop();
        var self=this;
        this.id=setInterval(function(){self.task();},this.interval);
    }
  , stop:function(){
        if(typeof this.id=='object'){
            console.log('Stop ... '+Date.now());
            clearInterval(this.id);
            delete this.id;
        }
    }
  , task:function(){
        var self=this;
        functions.get({
            host:'http://localhost:5984'
          , dbname:'/pleni_site_one'
          , view:'/_design/default/_view/wait'
        })
        .then(functions.look)
        .then(functions.headers)
        .then(functions.fetch)
        .then(functions.scrap)
        .then(functions.register)
        .then(functions.spread)
        .fail(function(error){
            if(error){
                console.log('ERROR');
                console.log(error);
                self.stop();
            }
        })
    }
};

var functions={
    get:function(settings){
        var deferred=Q.defer()
          , url=settings.host+settings.dbname+settings.view+'?limit=1';

        request.get({url:url},function(error,response,body){
            if(!error&&response.statusCode==200){
                var json=JSON.parse(body);
                if(json.total_rows!=0){
                    var row=json.rows[0];
                    deferred.resolve([settings, row]);
                    return;
                }
            }
            deferred.reject(error);
        });

        return deferred.promise;
    }
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

                    if(/^[a-z]*:\/\/.*/i.test(link)){
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
};

var messages={
    ready: {planner:'ready!!'}
  , run:   {planner:'running'}
  , stop:  {planner:'stopped'}
};

app.set('port',process.env.PORT||3001);
app.disable('x-powered-by');
app.use(bodyparser.json())

http.createServer(app).listen(app.get('port'),function(){
    console.log('Express server listening on port '+app.get('port'));
});

app.get('/',function(request,response){
    response.json(messages.ready);
});

app.post('/_run',function(request,response){
    planner.run();
    response.json(messages.run);
});

app.post('/_stop',function(request,response){
    planner.stop();
    response.json(messages.stop);
});

module.exports=app;
module.exports.messages=messages;

