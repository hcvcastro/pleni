'use strict';

var extend=require('underscore').extend
  , validate=require('../../../core/validators')
  , _success=require('../../../core/json-response').success
  , _error=require('../../../core/json-response').error
  , schema=require('../../../core/schema')
  , test=require('../../../core/functions/notifiers/test')
  , get=require('../../../core/functions/notifiers/get')
  , add=require('../../../core/functions/notifiers/add')
  , remove=require('../../../core/functions/notifiers/remove')
  , clean=require('../../../core/functions/notifiers/clean')
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
        response.json(request.user.resources.notifiers
        .filter(function(notifier){
            return Boolean(notifier.attrs.readable)
        })
        .map(function(notifier){
            return {
                id:notifier.id
              , type:(notifier.attrs.virtual?'virtual':'real')
              , readonly:!Boolean(notifier.attrs.writable)
              , notifier:{
                    host:notifier.notifier.host
                  , port:notifier.notifier.port
                }
            };
        }));
    });

    app.put('/resources/notifiers',authed,function(request,response){
        if(schema.js.validate(request.body,schema.notifiers).length==0){
            var resources=request.user.resources

            resources.notifiers=resources.notifiers.filter(function(notifier){
                return !(Boolean(notifier.attrs.readable))||
                       !(Boolean(notifier.attrs.writable));
            });

            resources.notifiers=resources.notifiers.concat(request.body.map(
            function(notifier){
                return {
                    id:validate.toString(notifier.id)
                  , attrs:{
                        virtual:(notifier.type=='virtual')
                      , readable:true
                      , writable:true
                    }
                  , notifier:{
                        host:validate.toValidHost(notifier.notifier.host)
                      , port:validate.toInt(notifier.notifier.port)
                    }
                };
            }));

            request.user.save();
            response.status(201).json(_success.ok);
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/resources/notifiers',authed,function(request,response){
        if(schema.js.validate(request.body,schema.notifier).length==0){
            var resources=request.user.resources
              , notifiers=resources.notifiers
              , notifier=get_element(request.body.id,notifiers)

            if(!notifier){
                var new_notifier={
                    id:validate.toString(request.body.id)
                  , attrs:{
                        virtual:(request.body.type=='virtual')
                      , readable:true
                      , writable:true
                    }
                  , notifier:{
                        host:validate.toValidHost(request.body.notifier.host)
                      , port:validate.toInt(request.body.notifier.port)
                    }
                };

                notifiers.push(new_notifier);

                request.user.save();
                response.status(201).json({
                    id:new_notifier.id
                  , type:(new_notifier.attrs.virtual?'virtual':'real')
                  , readonly:!Boolean(new_notifier_attrs.writable)
                  , db:{
                        host:new_notifier.db.host
                      , port:new_notifier.db.port
                    }
                });
            }else{
                response.status(403).json(_error.notoverride);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/resources/notifiers',authed,function(request,response){
        var resources=request.user.resources

        resources.notifiers=resources.notifiers.filter(function(notifier){
            return !(Boolean(notifier.attrs.readable))||
                   !(Boolean(notifier.attrs.writable));
        });

        request.user.save();
        response.status(200).json(_success.ok);
    });

    app.post('/resources/notifiers/_check',authed,function(request,response){
        if(schema.js.validate(request.body,schema.notifier).length==0){
            var packet={
                    notifier:{
                        host:validate.toValidHost(request.body.notifier.host)+
                            ':'+validate.toInt(request.body.notifier.port)
                    }
                }

            if(request.body.type=='virtual'){
                packet.notifier.host+='/notifier';
            }

            test(packet)
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
          , resources=request.user.resources
          , notifiers=resources.notifiers
          , notifier=get_element(id,notifiers)

        if(notifier){
            response.status(200).json({
                id:notifier[1].id
              , type:(notifier[1].attrs.virtual?'virtual':'real')
              , readonly:!Boolean(notifier[1].attrs.writable)
              , notifier:{
                    host:notifier[1].notifier.host
                  , port:notifier[1].notifier.port
                }
            });
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    app.put('/resources/notifiers/:notifier',authed,function(request,response){
        var id=validate.toString(request.params.notifier)
          , resources=request.user.resources
          , notifiers=resources.notifiers
          , notifier=get_element(id,notifiers)

        if(schema.js.validate(request.body,schema.notifier).length==0){
            var new_notifier={
                id:id
              , attrs:{
                    virtual:(request.body.type=='virtual')
                  , readable:true
                  , writable:true
                }
              , notifier:{
                    host:validate.toValidHost(request.body.notifier.host)
                  , port:validate.toInt(request.body.notifier.port)
                }
            };

            if(notifier){
                if(notifier[1].attrs.readable&&notifier[1].attrs.writable){
                    notifiers[notifier[0]]=new_notifier;
                    response.status(200).json({
                        id:new_notifier.id
                      , type:(new_notifier.attrs.virtual?'virtual':'real')
                      , readonly:!Boolean(new_notifier.attrs.writable)
                      , notifier:{
                            host:new_notifier.notifier.host
                          , port:new_notifier.notifier.port
                        }
                    });
                }else{
                    response.status(403).json(_error.notoverride);
                }
            }else{
                notifiers.push(new_notifier);
                response.status(201).json({
                    id:new_notifier.id
                  , type:(new_notifier.attrs.virtual?'virtual':'real')
                  , readonly:!Boolean(new_notifier.attrs.writable)
                  , notifier:{
                        host:new_notifier.notifier.host
                      , port:new_notifier.notifier.port
                    }
                });
            }

            resources.notifiers=notifiers;
            request.user.save();
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/resources/notifiers/:notifier',authed,
        function(request,response){
        var id=validate.toString(request.params.notifier)
          , resources=request.user.resources
          , notifiers=resources.notifiers
          , notifier=get_element(id,notifiers)

        if(notifier){
            if(notifier[1].attrs.readable&&notifier[1].attrs.writable){
                notifiers.splice(notifier[0],1);
                resources.notifiers=notifiers;
                request.user.save();

                response.status(200).json(_success.ok);
            }else{
                response.status(403).json(_error.notoverride);
            }
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    var generic_action=function(request,response,json,sequence,next){
        var id=validate.toString(request.params.notifier)
          , resources=request.user.resources
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
                  , cookie:request.headers.cookie
                }
            };

            if(notifier[1].attrs.virtual){
                args.notifier.host+='notifier';
            }

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
                //notifiers[notifier[0]].notifier.planners=
                //args.notifier.planners;
                //resources.notifiers=notifiers;
                //request.user.save();

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
          , resources=request.user.resources
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

    app.post('/resources/notifiers/:notifier/_remove',authed,
        function(request,response){
        var id=request.body.planner
          , resources=request.user.resources
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

