'use strict';

pleni.factory('Resources',['$sessionStorage',
    'DBServers','Repositories','Planners','Notifiers',
    function($sessionStorage,DBServers,Repositories,Planners,Notifiers){
        var get_element=function(needle,haystack){
                for(var i in haystack){
                    if(haystack[i].id==needle){
                        return [i,haystack[i]];
                    }
                }
                return;
            }
          , bind=function(func,param,success,failure){
                func(param,function(data){
                    if(success){success(data);}
                },function(error){
                    if(failure){failure(error);}
                });
            }

        return {
            dbservers:{
                load:function(success,failure){
                    DBServers.query(function(data){
                        $sessionStorage.dbservers=new Array();
                        for(var i=0;i<data.length;i++){
                            $sessionStorage.dbservers.push({
                                id:data[i].id
                              , db:{
                                    host:data[i].db.host
                                  , port:data[i].db.port
                                  , user:data[i].db.user
                                  , prefix:data[i].db.prefix
                                }
                              , check:'unknown'
                            });
                        }
                        if(success){success(data);}
                    },function(error){
                        if(failure){failure(error);}
                    });
                }
              , create:function(dbserver,success,failure){
                    bind(DBServers.save,dbserver,success,failure);
                }
              , update:function(dbserver,success,failure){
                    bind(DBServers.update,dbserver,success,failure);
                }
              , check:function(dbserver,success,failure){
                    bind(DBServers.check,dbserver,success,failure);
                }
              , scan:function(dbserver,success,failure){
                    bind(DBServers.scan,dbserver,success,failure);
                }
              , delete:function(dbserver,success,failure){
                    bind(DBServers.delete,dbserver,success,failure);
                }
            }
          , repositories:{
                load:function(success,failure){
                    Repositories.query(function(data){
                        $sessionStorage.repositories=new Array();
                        for(var i=0;i<data.length;i++){
                            $sessionStorage.repositories.push({
                                id:data[i].id
                              , _dbserver:data[i]._dbserver
                              , db:{
                                    name:data[i].db.name
                                }
                              , check:'unknown'
                              , type:'site'
                            });
                        }
                        if(success){success(date);}
                    },function(error){
                        if(failure){failure(error);}
                    });
                }
              , create:function(repository,success,failure){
                    bind(Repositories.save,repository,success,failure);
                }
              , update:function(repository,success,failure){
                    bind(Repositories.update,repository,success,failure);
                }
              , check:function(repository,success,failure){
                    bind(Repositories.check,repository,success,failure);
                }
              , delete:function(repository,success,failure){
                    bind(Repositories.delete,repository,success,failure);
                }
            }
          , planners:{
                load:function(success,failure){
                    Planners.query(function(data){
                        $sessionStorage.planners=new Array();
                        for(var i=0;i<data.length;i++){
                            $sessionStorage.planners.push({
                                id:data[i].id
                              , planner:{
                                    host:data[i].planner.host
                                  , port:data[i].planner.port
                                }
                              , type:'?'
                              , check:'unknown'
                              , status:'unknown'
                              , follow:(get_element(
                                    data[i].id,$sessionStorage.threads)
                                        !==undefined)
                              , set:{
                                    status:'unknown'
                                  , name:''
                                  , count:undefined
                                  , interval:undefined
                                  , tid:0
                                  , schema:{}
                                }
                            });
                        }
                        if(success){success(data);}
                    },function(error){
                        if(error){failure(error);}
                    });
                }
              , create:function(planner,success,failure){
                    bind(Planners.save,planner,success,failure);
                }
              , update:function(planner,success,failure){
                    bind(Planners.update,planner,success,failure);
                }
              , check:function(planner,success,failure){
                    bind(Planners.check,planner,success,failure);
                }
              , status:function(planner,success,failure){
                    bind(Planners.status,planner,success,failure);
                }
              , isset:function(planner,success,failure){
                    bind(Planners.isset,planner,success,failure);
                }
              , api:function(planner,success,failure){
                    bind(Planners.api,planner,success,failure);
                }
              , set:function(planner,success,failure){
                    bind(Planners.set,planner,success,failure);
                }
              , tid:function(planner,success,failure){
                    bind(Planners.tid,planner,success,failure);
                }
              , get:function(planner,success,failure){
                    bind(Planners.get,planner,success,failure);
                }
              , unset:function(planner,success,failure){
                    bind(Planners.unset,planner,success,failure);
                }
              , run:function(planner,success,failure){
                    bind(Planners.run,planner,success,failure);
                }
              , stop:function(planner,success,failure){
                    bind(Planners.stop,planner,success,failure);
                }
              , delete:function(planner,success,failure){
                    bind(Planners.delete,planner,success,failure);
                }
            }
          , notifiers:{
                load:function(success,failure){
                    Notifiers.query(function(data){
                        $sessionStorage.notifiers=new Array();
                        for(var i=0;i<data.length;i++){
                            $sessionStorage.notifiers.push({
                                id:data[i].id
                              , notifier:{
                                    host:data[i].notifier.host
                                  , port:data[i].notifier.port
                                }
                              , type:'?'
                              , check:'unknown'
                              , planners:new Array()
                            });
                        }
                        if(success){success(data);}
                    },function(error){
                        if(error){failure(error);}
                    });
                }
              , create:function(notifier,success,failure){
                    bind(Notifiers.save,notifier,success,failure);
                }
              , update:function(notifier,success,failure){
                    bind(Notifiers.update,notifier,success,failure);
                }
              , check:function(notifier,success,failure){
                    bind(Notifiers.check,notifier,success,failure);
                }
              , get:function(notifier,success,failure){
                    bind(Notifiers.get,notifier,success,failure);
                }
              , add:function(notifier,success,failure){
                    bind(Notifiers.add,notifier,success,failure);
                }
              , remove:function(notifier,success,failure){
                    bind(Notifiers.remove,notifier,success,failure);
                }
              , clean:function(notifier,success,failure){
                    bind(Notifiers.clean,notifier,success,failure);
                }
              , delete:function(notifier,success,failure){
                    bind(Notifiers.delete,notifier,success,failure);
                }
            }
        };
}]);

