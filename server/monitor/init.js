'use strict';

var App=require('./models/app')
  , DBServer=require('./models/dbserver')
  , Planner=require('./models/planner')
  , User=require('./models/user')
  , Q=require('q')
  , db_test=require('../../core/functions/databases/test')
  , db_auth=require('../../core/functions/databases/auth')
  , db_list=require('../../core/functions/databases/list')
  , db_infodbs=require('../../core/functions/databases/infodbs')
  , planner_test=require('../../core/functions/planners/test')
  , planner_api=require('../../core/functions/planners/api')
  , planner_get=require('../../core/functions/planners/get')

module.exports=function(app,connect){
    var redis=app.get('redis')
      , ioc=app.get('ioc')

    App.find({},function(err,apps){
        var params={}

        apps.forEach(function(app){
            params[app.key]=app.id;
        });

        if(apps.length>0){
            redis.hmset('monitor:apps',params,function(err,reply){
                if(err){
                    console.log(err);
                }
            });
        }
    });

    DBServer.find({},function(err,dbservers){
        var params1={}

        dbservers.forEach(function(dbserver){
            params1[dbserver.id]=JSON.stringify({
                db:dbserver.db
            });
        });

        Q.all(dbservers.map(function(dbserver){
            return db_test({
                id:dbserver.id
              , db:{
                    host:dbserver.db.host+':'+dbserver.db.port
                  , user:dbserver.db.user
                  , pass:dbserver.db.pass
                  , prefix:dbserver.db.prefix
                }
            })
            .then(db_auth)
            .then(db_list)
            .then(db_infodbs)
            .fail(function(error){})
        }))
        .spread(function(){
            var params2={}

            for(var arg in arguments){
                if(arguments[arg]){
                    var id=arguments[arg].id

                    arguments[arg].db.explist.forEach(function(repository){
                        params2[repository.db_name]=JSON.stringify({
                            dbserver:id
                          , dbinfo:repository
                        });
                    });

                    if(arguments[arg].auth){
                        var json=JSON.parse(params1[id])

                        json.auth=arguments[arg].auth;
                        params1[id]=JSON.stringify(json);
                    }
                }
            }

            if(Object.keys(params1).length){
                redis.hmset('monitor:dbservers',params1);
                if(Object.keys(params2).length){
                    redis.hmset('monitor:repositories',params2);
                }
            }
        });
    });

    Planner.find({},function(err,planners){
        var params1={}
          , free=[]

        planners.forEach(function(planner){
            if(planner.planner.tid){
                params1[planner.id]=JSON.stringify({
                    planner:planner.planner
                  , status:'stopped'
                });
                free.push(planner.id);
                connect(planner.id,planner.planner.host,planner.planner.port);
            }
        });

        Q.all(planners.map(function(planner){
            var packet={
                    id:planner.id
                  , planner:{
                        host:planner.planner.host+':'+planner.planner.port
                    }
                }

            if(planner.planner.tid){
                packet.planner.tid=planner.planner.tid;
            }

            return planner_test(packet)
                .then(planner_api)
                .fail(function(error){});
        }))
        .spread(function(){
            var params2={}

            for(var arg in arguments){
                if(arguments[arg]){
                    var id=arguments[arg].id

                    arguments[arg].planner.tasks.forEach(function(task){
                        if(!params2[task.name]){
                            params2[task.name]={
                                schema:task.schema
                              , planners:[]
                            };
                        }

                        params2[task.name].planners.push(id);
                    });
                }
            }

            for(var arg in params2){
                params2[arg]=JSON.stringify(params2[arg]);
            }

            if(Object.keys(params1).length){
                redis.hmset('monitor:planners',params1);
                redis.sadd('monitor:free',free);
                if(Object.keys(params2).length){
                    redis.hmset('monitor:apis',params2);
                }
            }
        });
    });
};

