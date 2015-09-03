'use strict';

var _url=require('url')
  , base='../../functions'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
  , init=require(base+'/repositories/sites/fetch/init')
  , wait=require(base+'/repositories/sites/fetch/getwaitdocument')
  , lock=require(base+'/repositories/sites/fetch/lockdocument')
  , headrequest=require(base+'/repositories/sites/fetch/headrequest')
  , getrequest=require(base+'/repositories/sites/fetch/getrequest')
  , createrequest=require(base+'/repositories/sites/fetch/createrequest')
  , analyzer=require(base+'/repositories/sites/fetch/htmlanalyzer')
  , createpage=require(base+'/repositories/sites/fetch/createpage')
  , getrequests1=require(base+'/repositories/sites/view/getrequests1')
  , spread=require(base+'/repositories/sites/fetch/spreadrels')
  , createfile=require(base+'/repositories/sites/fetch/createfile')
  , complete=require(base+'/repositories/sites/fetch/completedocument')

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
 *          ts
 *      task
 *          wait
 *              id
 *              _rev
 *              url
 *              ts_created
 *          lock
 *              id
 *              _rev
 *          head
 *              status
 *              headers
 *          get
 *              status
 *              headers
 *              body
 *              sha1
 *              md5
 *          refs
 *          rels
 *          page
 *              id
 *              _rev
 *          spread
 *          file
 *              id
 *              _rev
 *          complete
 *              id
 *              _rev
 *      site
 *          filters
 *          list
 */
module.exports=function(params,repeat,stop,notifier){
    init(params)
    .then(test)
    .then(auth)
    .then(wait)
    .then(lock)
    .then(headrequest)
    .then(getrequest)
    .then(createrequest)
    .then(analyzer)
    .then(createpage)
    .then(getrequests1)
    .then(spread)
    .then(createfile)
    .then(complete)
    .then(function(args){
        if(args.task.complete&&args.task.page.id){
            var url=_url.parse(args.task.wait.url)
              , page=args.task.complete.id.split('::')[3]
              , type=args.task.page.id.split('::')[0]
              , status=(type=='page')?'complete':'wait'
              , mimetype=args.task.head.headers['content-type']
                    .match(/[a-z]+\/[a-z-]+/i)[0]

            notifier({
                action:'task'
              , task:{
                    id:'site/fetch'
                  , msg:{
                        node:{
                            page:page
                          , status:status
                          , statuscode:args.task.head.status
                          , mimetype:mimetype
                          , type:type
                          , rels:(function(rels){
                                if(rels){
                                    return rels.filter(function(i){
                                        return _url.parse(i.url).host==url.host;
                                    }).map(function(i){
                                        return _url.parse(i.url).pathname;
                                    });
                                }else{
                                    return [];
                                }
                            })(args.task.rels)
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
                    action:'error'
                  , error:error
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

