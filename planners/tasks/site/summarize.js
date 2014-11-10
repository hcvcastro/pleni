'use strict';

var base='../../functions'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
  , design=require(base+'/repositories/sites/summarize/designdocument')

/*
 * Task for summarize a repository of site
 * args input
 *      db
 *          host
 *          name
 *          user
 *          pass
 *
 * args output
 *      auth
 *          cookie
 *      site
 *          design
 */
module.exports=function(params,repeat,stop){
    test(params)
    .then(auth)
    .then(design)
    .then(function(args){
        console.log('RUN summarize --> '+args.db.name);
        stop();
    })
    .fail(function(error){
        console.log(error);
        stop();
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
    }
  , 'required':['db']
};

