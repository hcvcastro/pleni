'use strict';

var extend=require('underscore').extend
  , validate=require('../../../planners/utils/validators')
  , _success=require('../../../planners/utils/json-response').success
  , _error=require('../../../planners/utils/json-response').error
  , test=require('../../../planners/functions/planners/test')
  , status=require('../../../planners/functions/planners/status')
  , api=require('../../../planners/functions/planners/api')
  , set=require('../../../planners/functions/planners/set')
  , get=require('../../../planners/functions/planners/get')
  , unset=require('../../../planners/functions/planners/unset')
  , run=require('../../../planners/functions/planners/run')
  , stop=require('../../../planners/functions/planners/stop')
  , schema=require('../../utils/schema')
  , get_element=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].id==needle){
                return [i,haystack[i]];
            }
        }
        return;
    };

module.exports=function(app){
    app.get('/resources/planners',function(request,response){
        response.json(app.get('resources').planners.map(
            function(planner){
                return {
                    id:planner.id
                  , planner:{
                        host:planner.planner.host
                      , port:planner.planner.port
                    }
                };
            }));
    });

    app.put('/resources/planners',function(request,response){
        if(schema.js.validate(request.body,schema.planners).length==0){
            var resources=app.get('resources');
            resources.planners=request.body.map(function(planner){
                return {
                    id:validate.toString(planner.id)
                  , planner:{
                        host:validate.toValidHost(planner.planner.host)
                      , port:validate.toInt(planner.planner.port)
                    }
                };
            });

            app.set('resources',resources);
            response.status(201).json(_success.ok);
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/resources/planners',function(request,response){
        if(schema.js.validate(request.body,schema.planner).length==0){
            var resources=app.get('resources')
              , planners=resources.planners
              , planner=get_element(request.body.id,planners)

            if(!planner){
                var new_planner={
                    id:validate.toString(request.body.id)
                  , planner:{
                        host:validate.toValidHost(request.body.planner.host)
                      , port:validate.toInt(request.body.planner.port)
                    }
                };

                planners.push(new_planner);
                resources.planners=planners;
                app.set('resources',resources);

                response.status(201).json(new_planner);
            }else{
                response.status(403).json(_error.notoverride);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/resources/planners',function(request,response){
        var resources=app.get('resources')

        resources.planners=[];
        app.set('resources',resources);
        response.status(200).json(_success.ok);
    });

    app.post('/resources/planners/_check',function(request,response){
        if(schema.js.validate(request.body,schema.planner).length==0){
            test({
                planner:{
                    host:validate.toValidHost(request.body.planner.host)+':'+
                         validate.toInt(request.body.planner.port)
                }
            })
            .then(function(args){
                response.status(200).json(_success.ok);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(401).json(_error.auth);
                }else if(error.error=='response_malformed'){
                    response.status(400).json(_error.json);
                }
            })
            .done();
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.get('/resources/planners/:planner',function(request,response){
        var id=validate.toString(request.params.planner)
          , planners=app.get('resources').planners
          , planner=get_element(id,planners)

        if(planner){
            response.status(200).json({
                id:planner[1].id
              , planner:{
                    host:planner[1].planner.host
                  , port:planner[1].planner.port
                }
            });
            return;
        }

        response.status(404).json(_error.notfound);
    });

    app.put('/resources/planners/:planner',function(request,response){
        var id=validate.toString(request.params.planner)
          , resources=app.get('resources')
          , planners=resources.planners
          , planner=get_element(id,planners)

        if(schema.js.validate(request.body,schema.planner).length==0){
            var new_planner={
                id:id
              , planner:{
                    host:validate.toValidHost(request.body.planner.host)
                  , port:validate.toInt(request.body.planner.port)
                }
            };

            if(planner){
                planners[planner[0]]=new_planner;
                response.status(200).json({
                    id:new_planner.id
                  , planner:{
                        host:new_planner.planner.host
                      , port:new_planner.planner.port
                    }
                });
            }else{
                planners.push(new_planner);
                response.status(201).json({
                    id:new_planner.id
                  , planner:{
                        host:new_planner.planner.host
                      , port:new_planner.planner.port
                    }
                });
            }

            resources.planners=planners;
            app.set('resources',resources);
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/resources/planners/:planner',function(request,response){
        var id=validate.toString(request.params.planner)
          , resources=app.get('resources')
          , planners=resources.planners
          , planner=get_element(id,planners)

        if(planner){
            planners.splice(planner[0],1);
            resources.planners=planners;
            app.set('resources',resources);
            response.status(200).json(_success.ok);
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    app.post('/resources/planners/:planner/_tid',function(request,response){
        var id=validate.toString(request.params.planner)
          , resources=app.get('resources')
          , planners=resources.planners
          , planner=get_element(id,planners)

        if(schema.js.validate(request.body,schema.planner_set).length==0){
            if(planner){
                planners[planner[0]].planner.tid=request.body.tid;
                resources.planners=planners;

                app.set('resources',resources);
                response.status(200).json({
                    planner:{
                        host:planner[1].planner.host
                      , result:true
                    }
                });
            }else{
                response.status(404).json(_error.notfound);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    var generic_action=function(request,response,json,sequence,next){
        var id=validate.toString(request.params.planner)
          , resources=app.get('resources')
          , planners=resources.planners
          , planner=get_element(id,planners)
          , body=request.body

        delete body.server;
        if(json){
            if(schema.js.validate(body,json).length!=0){
                response.status(403).json(_error.validation);
                return;
            }
        }

        if(planner){
            var args={
                planner:{
                    host:planner[1].planner.host+':'+
                         planner[1].planner.port
                }
            };
            if(planner[1].planner.tid){
                args.planner.tid=planner[1].planner.tid;
            }
            if(json){
                args=extend(body,args);
            }

            sequence.reduce(function(previous,current){
                return previous.then(current);
            },test(args))
            .then(function(args){
                next(resources,planners,planner,args);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(401).json(_error.auth);
                }else if(error.error=='response_malformed'){
                    response.status(400).json(_error.json);
                }else{
                    //console.log(error);
                    response.status(403).json(_error.badrequest);
                }
            })
            .done();
        }else{
            response.status(404).json(_error.notfound)
        }
    };

    app.post('/resources/planners/:planner/_check',function(request,response){
        return generic_action(request,response,null,[],
            function(resources,planners,planner,args){
                response.status(200).json({
                    planner:{
                        host:args.planner.host
                      , type:args.planner.type
                    }
                });
        });
    });

    app.post('/resources/planners/:planner/_status',function(request,response){
        return generic_action(request,response,null,[status],
            function(resources,planners,planner,args){
                planners[planner[0]].planner.status=args.planner.status;
                resources.planners=planners;

                app.set('resources',resources);
                response.status(200).json({
                    planner:{
                        host:args.planner.host
                      , status:args.planner.status
                    }
                });
        });
    });

    app.post('/resources/planners/:planner/_api',function(request,response){
        return generic_action(request,response,null,[api],
            function(resources,planners,planner,args){
                planners[planner[0]].planner.tasks=args.planner.tasks;
                resources.planners=planners;

                app.set('resources',resources);
                response.status(200).json({
                    planner:{
                        host:args.planner.host
                      , tasks:args.planner.tasks.map(function(task){
                            var schema;
                            if(Array.isArray(task.schema)){
                                schema=task.schema[1];
                            }else{
                                schema=task.schema;
                            }
                            return {
                                name:task.name
                              , schema:schema
                            }
                        })
                    }
                });
        });
    });

    app.post('/resources/planners/:planner/_set',function(request,response){
        return generic_action(request,response,schema.task,[set],
            function(resources,planners,planner,args){
                planners[planner[0]].planner.tid=args.planner.tid;
                resources.planners=planners;

                app.set('resources',resources);
                response.status(200).json({
                    planner:{
                        host:args.planner.host
                      , result:true
                    }
                });
        });
    });

    app.post('/resources/planners/:planner/_get',function(request,response){
        return generic_action(request,response,null,[get],
            function(resources,planners,planner,args){
                planners[planner[0]].planner.task=args.planner.task;
                resources.planners=planners;

                app.set('resources',resources);
                response.status(200).json({
                    planner:{
                        host:args.planner.host
                      , task:{
                            name:args.planner.task.name
                          , count:args.planner.task.count
                          , interval:args.planner.task.interval
                        }
                    }
                });
        });
    });

    app.post('/resources/planners/:planner/_isset',function(request,response){
        return generic_action(request,response,null,[],
            function(resources,planners,planner,args){
                response.status(200).json({
                    planner:{
                        host:args.planner.host
                      , result:'tid' in args.planner
                    }
                });
        });
    });

    app.post('/resources/planners/:planner/_unset',function(request,response){
        return generic_action(request,response,null,[unset],
            function(resources,planners,planner,args){
                delete planners[planner[0]].planner.tid;
                resources.planners=planners;

                app.set('resources',resources);
                response.status(200).json({
                    planner:{
                        host:args.planner.host
                      , result:true
                    }
                });
        });
    });

    app.post('/resources/planners/:planner/_run',function(request,response){
        var targs=request.body.targs;
        if(targs._repository){
            var repository=get_element(
                targs._repository,app.get('resources').repositories);
            if(repository){
                delete targs._repository;
                targs.db={};
                targs.db.name=repository[1].db.name;
                targs._dbserver=repository[1]._dbserver;
                request.body.targs=targs;
            }else{
                response.status(403).json(_error.badrequest);
                return;
            }
        }
        if(targs._dbserver){
            var dbserver=get_element(
                targs._dbserver,app.get('resources').dbservers);
            if(dbserver){
                delete targs._dbserver;
                if(targs.db){
                    targs.db.host=dbserver[1].db.host+':'+
                                  dbserver[1].db.port;
                    targs.db.user=dbserver[1].db.user;
                    targs.db.pass=dbserver[1].db.pass;
                    targs.db.prefix=dbserver[1].db.prefix;
                }
                request.body.targs=targs;
            }else{
                response.status(403).json(_error.badrequest);
                return;
            }
        }

        return generic_action(request,response,schema.planner_runner,[run],
            function(resources,planners,planner,args){
                planners[planner[0]].planner.status='running';
                resources.planners=planners;

                app.set('resources',resources);
                response.status(200).json({
                    planner:{
                        host:args.planner.host
                      , status:'running'
                    }
                });
        });
    });

    app.post('/resources/planners/:planner/_stop',function(request,response){
        return generic_action(request,response,null,[stop],
            function(resources,planners,planner,args){
                planners[planner[0]].planner.status='stopped';
                resources.planners=planners;

                app.set('resources',resources);
                response.status(200).json({
                    planner:{
                        host:args.planner.host
                      , status:'stopped'
                    }
                });
        });
    });
};

