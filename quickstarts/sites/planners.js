'use strict';

var test=require('../../planners/functions/planners/test')
  , set=require('../../planners/functions/planners/set')
  , unset=require('../../planners/functions/planners/unset')
  , run=require('../../planners/functions/planners/run')
  , tid=undefined

exports.create=function(planner,db,url,success,fail){
    var pkg={
        planner:{
            host:planner.host+':'+planner.port
        }
      , targs:{
            db:db
          , site:{
                url:url
            }
        }
      , task:{
            name:'site/create'
          , count:1
          , interval:1000
        }
      , debug:true
    };

    test(pkg)
    .then(set)
    .then(run)
    .fail(fail)
    .done(function(args){
        tid=args.planner.tid;
        success(args);
    });
};

exports.fetch=function(planner,db,agent,success,fail){
    var pkg={
        planner:{
            host:planner.host+':'+planner.port
          , tid:tid
        }
      , targs:{
            db:db
          , headers:[{
                name:'User-Agent'
              , value:agent
            }]
        }
      , task:{
            name:'site/fetch'
          , count: 20
          , interval: 1000
        }
      , debug:true
    };

    test(pkg)
    .then(unset)
    .then(set)
    .then(run)
    .then(success)
    .fail(fail)
    .done();
};

