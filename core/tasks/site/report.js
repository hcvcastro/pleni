'use strict';

var base='../../functions'
  , base1=base+'/repositories/sites/report'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
  , check=require(base1+'/check')
  , design=require(base1+'/designdocument')
  , headerserver=require(base1+'/header/server')
  , headerstatus=require(base1+'/header/status')
  , headercontenttype=require(base1+'/header/contenttype')
  , headerpoweredby=require(base1+'/header/poweredby')
  , bodyrels=require(base1+'/body/rels')
  , bodyrefs=require(base1+'/body/refs')
  , bodyhashes=require(base1+'/body/hashes')
  , report=require(base1+'/report')

/*
 * Task for generation for base report of a site repository
 * args input
 *      db
 *          host
 *          name
 *          user
 *          pass
 *
 * args output
 *      db
 *          check
 *      auth
 *          cookie
 *          ts
 *      site
 *          design
 *              _rev
 *          report
 *              check
 *              _rev
 *      report
 *          header
 *              server
 *              status
 *              contenttype
 *              poweredby
 *          body
 *              rels
 *              refs
 *              hashes
 */
module.exports=function(params,repeat,stop,notifier){
    test(params)
    .then(auth)
    .then(check)
    .then(design)
    .then(headercontenttype)
    .then(headerpoweredby)
    .then(headerserver)
    .then(headerstatus)
    .then(bodyrels)
    .then(bodyrefs)
    .then(bodyhashes)
    .then(report)
    .then(function(args){
        notifier({
            action:'task'
          , task:{
                id:'site/report'
              , msg:'report generated ('+args.db.name+')'
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
},{
    'type':'object'
  , 'properties':{
        '_repository':{
            'type':'string'
          , 'format':'text'
          , 'minLength':3
        }
    }
  , 'required':['_repository']
}];

