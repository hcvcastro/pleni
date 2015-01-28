'use strict';

var base='../../functions'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
  , timestamp=require(base+'/repositories/sites/summarize/gettimestampdocument')
  , summary=require(base+'/repositories/sites/view/getsummary')
  , summarize=require(base+'/repositories/sites/summarize/summarize')

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
 *      task
 *          timestamp
 *              min
 *              max
 *              count
 */
module.exports=function(params,repeat,stop,notifier){
    test(params)
    .then(auth)
    .then(summary)
    .then(timestamp)
    .then(summarize)
    .then(function(args){
        notifier({
            action:'task'
          , task:{
                id:'site/summarize'
              , msg:'repository summarized ('+args.db.name+')'
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

