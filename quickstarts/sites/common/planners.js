'use strict';

var test=require('../../../planners/functions/planners/test')
  , set=require('../../../planners/functions/planners/set')
  , unset=require('../../../planners/functions/planners/unset')
  , run=require('../../../planners/functions/planners/run')
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

    if(tid){
        pkg.planner.tid=tid;
    }

    test(pkg)
    .then(set)
    .then(run)
    .fail(fail)
    .done(function(args){
        if(args&&args.planner&&args.planner.tid){
            tid=args.planner.tid;
            console.log('set sites/create ... '+pkg.targs.db.name);
            console.log(tid);
            success(args);
        }
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
          , count: 4
          , interval: 1000
        }
      , debug:true
    };

    test(pkg)
    .then(set)
    .then(run)
    .fail(fail)
    .done(function(args){
        if(args&&args.planner&&args.planner.tid){
            tid=args.planner.tid;
            console.log('set sites/fetch ... '+pkg.targs.db.name);
            console.log(tid);
            success(args);
        }
    });
};

