'use strict';

var validate=require('../../utils/validators')
  , base='../../functions'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
  , remove=require(base+'/databases/remove')

/*
 * Task for remove repositories for a site
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
 */
module.exports=function(params,repeat,stop){
    test(params)
    .then(auth)
    .then(remove)
    .then(function(args){
        console.log('RUN remove --> '+args.db.name);
        repeat();
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

