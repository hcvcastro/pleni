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
module.exports=function(params,repeat,stop,notifier){
    test(params)
    .then(auth)
    .then(create)
    .then(summary)
    .then(rootsite)
    .then(design)
    .then(function(args){
        notifier({
            task:{
                action:'create'
                name:args.db.name
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

