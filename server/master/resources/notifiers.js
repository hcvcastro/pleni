'use strict';

var extend=require('underscore').extend
  , validate=require('../../../core/validators')
  , _success=require('../../../core/json-response').success
  , _error=require('../../../core/json-response').error
  , test=require('../../../core/functions/notifiers/test')
  , get=require('../../../core/functions/notifiers/get')
  , add=require('../../../core/functions/notifiers/add')
  , remove=require('../../../core/functions/notifiers/remove')
  , clean=require('../../../core/functions/notifiers/clean')
  , schema=require('../../../core/schema')
  , get_element=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].id==needle){
                return [i,haystack[i]];
            }
        }
        return;
    };

module.exports=function(app){
    var authed=app.get('auth');

    app.get('/resources/notifiers',authed,function(request,response){
        response.json(app.get('resources').notifiers.map(
            function(notifier){
                return {
                    id:notifier.id
                  , notifier:{
                        host:notifier.notifier.host
                      , port:notifier.notifier.port
                    }
                };
            }));
    });

    app.put('/resources/notifiers',authed,function(request,response){
        if(schema.js.validate(request.body,schema.notifiers).length==0){
            var resources=app.get('resources');
            resources.notifiers=request.body.map(function(notifier){
                return {
                    id:validate.toString(notifier.id)
                  , notifier:{
                        host:validate.toValidHost(notifier.notifier.host)
                      , port:validate.toInt(notifier.notifier.port)
                    }
                };
            });

            app.set('resources',resources);
            response.status(201).json(_success.ok);
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/resources/notifiers',authed,function(request,response){
        if(schema.js.validate(request.body,schema.notifier).length==0){
            var resources=app.get('resources')
              , notifiers=resources.notifiers
              , notifier=get_element(request.body.id,notifiers)

            if(!notifier){
                var new_notifier={
                    id:validate.toString(request.body.id)
                  , notifier:{
                        host:validate.toValidHost(request.body.notifier.host)
                      , port:validate.toInt(request.body.notifier.port)
                    }
                };

                notifiers.push(new_notifier);
                resources.notifiers=notifiers;
                app.set('resources',resources);

                response.status(201).json(new_notifier);
            }else{
                response.status(403).json(_error.notoverride);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/resources/notifiers',authed,function(request,response){
        var resources=app.get('resources')

        resources.notifiers=[];
        app.set('resources',resources);
        response.status(200).json(_success.ok);
    });

    app.post('/resources/notifiers/_check',authed,function(request,response){
        if(schema.js.validate(request.body,schema.notifier).length==0){
            test({
                notifier:{
                    host:validate.toValidHost(request.body.notifier.host)+':'+
                         validate.toInt(request.body.notifier.port)
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

    app.get('/resources/notifiers/:notifier',authed,function(request,response){
        var id=validate.toString(request.params.notifier)
          , notifiers=app.get('resources').notifiers
          , notifier=get_element(id,notifiers)

        if(notifier){
            response.status(200).json({
                id:notifier[1].id
              , notifier:{
                    host:notifier[1].notifier.host
                  , port:notifier[1].notifier.port
                }
            });
            return;
        }

        response.status(404).json(_error.notfound);
    });

    app.put('/resources/notifiers/:notifier',authed,function(request,response){
        var id=validate.toString(request.params.notifier)
          , resources=app.get('resources')
          , notifiers=resources.notifiers
          , notifier=get_element(id,notifiers)

        if(schema.js.validate(request.body,schema.notifier).length==0){
            var new_notifier={
                id:id
              , notifier:{
                    host:validate.toValidHost(request.body.notifier.host)
                  , port:validate.toInt(request.body.notifier.port)
                }
            };

            if(notifier){
                notifiers[notifier[0]]=new_notifier;
                response.status(200).json({
                    id:new_notifier.id
                  , notifier:{
                        host:new_notifier.notifier.host
                      , port:new_notifier.notifier.port
                    }
                });
            }else{
                notifiers.push(new_notifier);
                response.status(201).json({
                    id:new_notifier.id
                  , notifier:{
                        host:new_notifier.notifier.host
                      , port:new_notifier.notifier.port
                    }
                });
            }

            resources.notifiers=notifiers;
            app.set('resources',resources);
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/resources/notifiers/:notifier',authed,function(request,response){
        var id=validate.toString(request.params.notifier)
          , resources=app.get('resources')
          , notifiers=resources.notifiers
          , notifier=get_element(id,notifiers)

        if(notifier){
            notifiers.splice(notifier[0],1);
            resources.notifiers=notifiers;
            app.set('resources',resources);
            response.status(200).json(_success.ok);
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    var generic_action=function(request,response,json,sequence,next){
        var id=validate.toString(request.params.notifier)
          , resources=app.get('resources')
          , notifiers=resources.notifiers
          , notifier=get_element(id,notifiers)
          , body=request.body

        delete body.server;
        if(json){
            if(schema.js.validate(body,json).length!=0){
                response.status(403).json(_error.validation);
                return;
            }
        }

        if(notifier){
            var args={
                notifier:{
                    host:notifier[1].notifier.host+':'+
                         notifier[1].notifier.port
                }
            };
            if(json){
                args=extend(body,args);
            }

            sequence.reduce(function(previous,current){
                return previous.then(current);
            },test(args))
            .then(function(args){
                next(resources,notifiers,notifier,args);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(401).json(_error.auth);
                }else if(error.error=='response_malformed'){
                    response.status(400).json(_error.json);
                }else{
                    console.log(error);
                    response.status(403).json(_error.badrequest);
                }
            })
            .done();
        }else{
            response.status(404).json(_error.notfound)
        }
    };

    app.post('/resources/notifiers/:notifier/_check',authed,
        function(request,response){
        return generic_action(request,response,null,[],
            function(resources,notifiers,notifier,args){
                response.status(200).json({
                    notifier:{
                        host:args.notifier.host
                      , type:args.notifier.type
                    }
                });
        });
    });

    app.post('/resources/notifiers/:notifier/_get',authed,
        function(request,response){
        return generic_action(request,response,null,[get],
            function(resources,notifiers,notifier,args){
                notifiers[notifier[0]].notifier.planners=args.notifier.planners;
                resources.notifiers=notifiers;

                app.set('resources',resources);

                response.status(200).json({
                    notifier:{
                        host:args.notifier.host
                      , _planners:args.notifier.planners.map(function(planner){
                            for(var i in resources.planners){
                                if(resources.planners[i].planner.host==
                                        planner.planner.host&&
                                    resources.planners[i].planner.port==
                                        planner.planner.port){
                                    return resources.planners[i].id;
                                }
                            }
                            return '';
                        })
                    }
                });
        });
    });

    app.post('/resources/notifiers/:notifier/_add',authed,
        function(request,response){
        var id=request.body.planner
          , resources=app.get('resources')
          , planners=resources.planners
          , planner=get_element(id,planners)

        if(planner){
            request.body.planner=planner[1].planner;
        }else{
            response.status(404).json(_error.notfound);
            return;
        }

        return generic_action(request,response,schema.notifier_planner,[add],
            function(resources,planners,planner,args){
                response.status(200).json({
                    notifier:{
                        host:args.notifier.host
                      , result:true
                    }
                });
        });
    });

    app.post('/resources/notifiers/:notifier/_remove',authed,function(
            request,response){
        var id=request.body.planner
          , resources=app.get('resources')
          , planners=resources.planners
          , planner=get_element(id,planners)

        if(planner){
            request.body.planner=planner[1].planner;
        }else{
            response.status(404).json(_error.notfound);
            return;
        }

        return generic_action(request,response,schema.notifier_planner,[remove],
            function(resources,planners,planner,args){
                response.status(200).json({
                    notifier:{
                        host:args.notifier.host
                      , result:true
                    }
                });
        });
    });

    app.post('/resources/notifiers/:notifier/_clean',authed,
        function(request,response){
        return generic_action(request,response,null,[clean],
            function(resources,planners,planner,args){
                response.status(200).json({
                    notifier:{
                        host:args.notifier.host
                      , result:true
                    }
                });
        });
    });
};

