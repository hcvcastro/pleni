'use strict';

var base='../../functions'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
  , create=require(base+'/databases/create')
  , summary=require(base+'/repositories/sites/create/summary')
  , rootsite=require(base+'/repositories/sites/create/rootsite')
  , design=require(base+'/repositories/sites/create/designdocument')

/*
 * Task for creation of a site repository
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
 *      db
 *          check
 *      auth
 *          cookie
 *          ts
 *      site
 *          summary
 *              _rev
 *          root
 *              _rev
 *          design
 *              _rev
 */
module.exports=function(params,repeat,stop,notifier){
    test(params)
    .then(auth)
    .then(create)
    .then(summary)
    .then(rootsite)
    .then(design)
    .then(function(args){
        notifier({
            action:'task'
          , task:{
                id:'site/create'
              , msg:'site repository created ('+args.db.name+')'
            }
        });
        stop();
    })
    .fail(function(error){
        notifier({
            error:error
        });
        stop();
    })
    .done();
};

module.exports.schema=[{
    'type':'object'
  , 'properties':{
        'db':{
            'type':'object'
          , 'properties':{
                'host':{
                    'type':'string'
                  , 'format':'url'
                  , 'minLength':7
                }
              , 'name':{
                    'type':'string'
                  , 'format':'text'
                  , 'minLength':3
                }
              , 'user':{
                    'type':'string'
                  , 'format':'text'
                  , 'minLength':3
                }
              , 'pass':{
                    'type':'string'
                  , 'format':'password'
                }
            }
          , 'required':['host','name','user','pass']
        }
      , 'site':{
            'type':'object'
          , 'properties':{
                'url':{
                    'type':'string'
                  , 'format':'url'
                  , 'minLength':7
                }
            }
          , 'required':['url']
        }
    }
  , 'required':['db','site']
},{
    'type':'object'
  , 'properties':{
        '_dbserver':{
            'type':'string'
          , 'format':'text'
          , 'minLength':3
        }
      , 'db':{
            'type':'object'
          , 'properties':{
                'name':{
                    'type':'string'
                  , 'format':'text'
                  , 'minLength':3
                }
            }
          , 'required':['name']
        }
      , 'site':{
            'type':'object'
          , 'properties':{
                'url':{
                    'type':'string'
                  , 'format':'url'
                  , 'minLength':7
                }
            }
          , 'required':['url']
        }
    }
  , 'required':['_dbserver','db','site']
}];

