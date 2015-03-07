'use strict';

var base='../../core/functions'
  , test=require(base+'/planners/test')
  , set=require(base+'/planners/set')
  , unset=require(base+'/planners/unset')
  , run=require(base+'/planners/run')
  , auth=require(base+'/databases/auth')
  , mapsite=require(base+'/repositories/sites/view/getmapsite')
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
    };

    if(tid){
        pkg.planner.tid=tid;
    }

    test(pkg)
    .then(set)
    .then(run)
    .done(function(args){
        if(args&&args.planner&&args.planner.tid){
            tid=args.planner.tid;
            success(args);
        }
    },fail);
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
    };

    test(pkg)
    .then(set)
    .then(run)
    .done(function(args){
        if(args&&args.planner&&args.planner.tid){
            tid=args.planner.tid;
            success(args);
        }
    },fail);
};

exports.free=function(planner,success,fail){
    var pkg={
        planner:{
            host:planner
          , tid:tid
        }
    };

    unset(pkg)
    .done(function(args){
        success(args);
    },fail);
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
    .done(function(args){
        success(args);
    },fail);
};

