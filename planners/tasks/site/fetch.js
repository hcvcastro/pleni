'use strict';

var validate=require('../../utils/validators')
  , base='../../functions'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
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
 *
 * args output
 *      auth
 *          cookie
 *      task
 *          wait
 *              id
 *              key
 *              value
 *          lock
 *              id
 *              key
 *              value
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
 */
module.exports=function(params,repeat,stop){
    test(params)
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
            console.log('RUN fetch --> '+args.task.complete.id);
        }
        repeat();
    })
    .fail(function(error){
        if(error.error=='conflict'&&error.reason=='Document update conflict.'){
            repeat();
        }else{
            console.log(error);
            stop();
        }
    })
    .done();
};

module.exports.schema={
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
        }
      , 'debug':{
            'type':'boolean'
        }
    }
  , 'required':['db']
};

