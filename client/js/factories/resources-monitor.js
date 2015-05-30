'use strict';

pleni.factory('Resources',['$sessionStorage',
    'Clients','DBServers','Planners',
    function($sessionStorage,
        Clients,DBServers,Planners){
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
            clients:{
                load:function(success,failure){
                    Clients.query(function(data){
                        $sessionStorage.clients=new Array();
                        for(var i=0;i<data.length;i++){
                            $sessionStorage.clients.push({
                                id:data[i].id
                              , key:data[i].key
                            });
                        }
                        if(success){success(data);}
                    },function(error){
                        if(failure){failure(error);}
                    });
                }
              , create:function(client,success,failure){
                    bind(Clients.save,client,success,failure);
                }
              , update:function(client,success,failure){
                    bind(Clients.update,client,success,failure);
                }
              , check:function(client,success,failure){
                    bind(Clients.check,client,success,failure);
                }
              , scan:function(client,success,failure){
                    bind(Clients.scan,client,success,failure);
                }
              , delete:function(client,success,failure){
                    bind(Clients.delete,client,success,failure);
                }
            }
          , dbservers:{
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
                              , api:new Array()
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
              , clean:function(planner,success,failure){
                    bind(Planners.clean,planner,success,failure);
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
        };
}]);
