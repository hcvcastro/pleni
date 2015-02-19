'use strict';

var test=require('../../../planners/functions/planners/test')
  , set=require('../../../planners/functions/planners/set')
  , unset=require('../../../planners/functions/planners/unset')
  , run=require('../../../planners/functions/planners/run')
  , auth=require('../../../planners/functions/databases/auth')
  , mapsite=require('../../../planners/functions/repositories/sites/view/getmapsite')
  , tid=undefined

exports.create=function(planner,db,url,success,fail){
    var pkg={
        planner:{
            host:planner
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
            host:planner
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

exports.free=function(planner,success,fail){
    var pkg={
        planner:{
            host:planner
          , tid:tid
        }
    };

    unset(pkg)
    .fail(fail)
    .done(function(args){
        console.log('unset sites/fetch ...'+pkg.planner.host);
        success(args);
    });
};

exports.mapsite=function(db,success,fail){
    var pkg={
        db:{
            host:db.host
          , user:db.user
          , pass:db.pass
          , name:db.name
        }
    };

    auth(pkg)
    .then(mapsite)
    .fail(fail)
    .done(function(args){
        console.log('mapsite request ...'+pkg.db.name);
        success(args);
    });
};

