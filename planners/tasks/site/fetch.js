'use strict';

var base='../../functions'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
  , init=require(base+'/repositories/sites/fetch/init')
  , wait=require(base+'/repositories/sites/fetch/getwaitdocument')
  , lock=require(base+'/repositories/sites/fetch/lockdocument')
  , head=require(base+'/repositories/sites/fetch/headrequest')
  , get=require(base+'/repositories/sites/fetch/getrequest')
  , body=require(base+'/repositories/sites/fetch/bodyanalyzer')
  , complete=require(base+'/repositories/sites/fetch/completedocument')
  , spread=require(base+'/repositories/sites/fetch/spreadrefs')

/*
 * Task for fetch os pages in a site repository
 * args input
 *      db
 *          host
 *          name
 *          user
 *          pass
 *      headers(*)
 *      debug(*)
 *
 * args output
 *      db
 *          check
 *      auth
 *          cookie
 *      task
 *          wait
 *              id
 *              key
 *              value
 *          lock
 *              ok
 *              id
 *              rev
 *          head
 *              status
 *              headers
 *              get
 *          get
 *              status
 *              headers
 *              body
 *              sha1
 *              md5
 *          ref
 *              links
 *              related
 *          complete
 *              ok
 *              id
 *              rev
 *          spread
 */
module.exports=function(params,repeat,stop,notifier){
    init(params)
    .then(test)
    .then(auth)
    .then(wait)
    .then(lock)
    .then(head)
    .then(get)
    .then(body)
    .then(complete)
    .then(spread)
    .then(function(args){
        if(args.task.complete){
            var url=args.task.complete.id.substr(5)
              , spread=args.task.spread
              , count=0
              , m=args.task.head.headers['content-type']
                                .match(/[a-z]+\/[a-z-]+/i)[0]

            if(spread){
                count=spread.length
            }

            notifier({
                action:'task'
              , task:{
                    id:'site/fetch'
                  , msg:{
                        node:{
                            page:url
                          , status:args.task.head.status
                          , mime:m
                          , get:args.task.head.get
                          , type:(function(x,y){
                                if(x=='/'){
                                    return 'root';
                                }else{
                                    if(y.indexOf('text/html')==0){
                                        return 'page';
                                    }else{
                                        return 'extra';
                                    }
                                }
                            })(url,m)
                          , rel:(function(x){
                                if(x.ref&&x.ref.related){
                                    return x.ref.related;
                                }else{
                                    return [];
                                }
                            })(args.task)
                        }
                    }
                }
            });
        }
        repeat();
    })
    .fail(function(error){
        if(error.error=='conflict'&&error.reason=='Document update conflict.'){
            repeat();
        }else{
            if(error.complete){
                notifier({
                    action:'task'
                  , task:{
                        id:'site/fetch'
                      , msg:'completed'
                    }
                });
            }else{
                console.log(error);
                notifier({
                    error:error
                });
            }
            stop();
        }
    })
    .done();
};

var headers=[
    'Accept'
  , 'Accept-Charset'
  , 'Accept-Encoding'
  , 'Accept-Language'
  , 'Accept-Datetime'
  , 'Authorization'
  , 'Cache-Control'
  , 'Connection'
  , 'Cookie'
  , 'Content-Length'
  , 'Content-MD5'
  , 'Content-Type'
  , 'Date'
  , 'Expect'
  , 'From'
  , 'Host'
  , 'If-Match'
  , 'If-Modified-Since'
  , 'If-None-Match'
  , 'If-Range'
  , 'If-Unmodified-Since'
  , 'Max-Forwards'
  , 'Origin'
  , 'Pragma'
  , 'Proxy-Authorization'
  , 'Range'
  , 'Referer'
  , 'TE'
  , 'User-Agent'
  , 'Upgrade'
  , 'Via'
  , 'Warning'
  , 'X-Requested-With'
  , 'DNT'
  , 'X-Forwarded-For'
  , 'X-Forwarded-Host'
  , 'X-Forwarded-Proto'
  , 'Front-End-Https'
  , 'X-Http-Method-Override'
  , 'X-ATT-DeviceId'
  , 'X-Wap-Profile'
  , 'Proxy-Connection'
];

module.exports.schema=[{
    'type':'object'
  , 'properties':{
        'db':{
            'type':'object'
          , 'properties':{
                'host':{
                    'type':'string'
                }
              , 'name':{
                    'type':'string'
                }
              , 'user':{
                    'type':'string'
                }
              , 'pass':{
                    'type':'string'
                }
            }
          , 'required':['host','name','user','pass']
        }
      , 'headers':{
            'type':'array'
          , 'items': {
                'type':'object'
              , 'properties':{
                    'name':{
                        'type':'string'
                      , 'enum':headers
                    }
                  , 'value':{
                        'type':'string'
                    }
                }
            }
        }
    }
  , 'required':['db']
},{
    'type':'object'
  , 'properties':{
        '_repository':{
            'type':'string'
          , 'format':'text'
          , 'minLength':3
        }
      , 'headers':{
            'type':'array'
          , 'items': {
                'type':'object'
              , 'properties':{
                    'name':{
                        'type':'string'
                      , 'enum':headers
                    }
                  , 'value':{
                        'type':'string'
                    }
                }
            }
        }
    }
  , 'required':['_repository']
}];

