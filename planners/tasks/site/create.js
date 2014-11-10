'use strict';

var base='../../functions'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
  , create=require(base+'/databases/create')
  , summary=require(base+'/repositories/sites/create/summary')
  , rootsite=require(base+'/repositories/sites/create/rootsite')
  , design=require(base+'/repositories/sites/create/designdocument')

/*
 * Task for creation of a repository of site
 * args input
 *      db
 *          host
 *          name
 *          user
 *          pass
 *      site
 *          url
 *
 * args output
 *      auth
 *          cookie
 *      site
 *          summary
 *          root
 *          design
 */
module.exports=function(params,repeat,stop){
    test(params)
    .then(auth)
    .then(create)
    .then(summary)
    .then(rootsite)
    .then(design)
    .then(function(args){
        console.log('RUN create --> '+args.db.name);
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
      , 'site':{
            'type':'object'
          , 'properties':{
                'url':{
                    'type':'string'
                }
            }
          , 'required':['url']
        }
    }
  , 'required':['db','site']
};

