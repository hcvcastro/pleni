'use strict';

var base='../../functions'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
  , design=require(base+'/reports/design/basic')
  , report=require(base+'/reports/document/basic')

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
 *      site
 *          design
 *              reports
 */
module.exports=function(params,repeat,stop,notifier){
    test(params)
    .then(auth)
    .then(design)
    .then(report)
    .then(function(args){
        notifier({
            action:'task'
          , task:{
                id:'report/basic'
              , msg:'basic report generated ('+args.db.name+')'
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

