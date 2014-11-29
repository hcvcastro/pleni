'use strict';

var validate=require('../../../planners/utils/validators')
  , _success=require('../../../planners/utils/json-response').success
  , _error=require('../../../planners/utils/json-response').error
  , test=require('../../../planners/functions/planners/test')
  , status=require('../../../planners/functions/planners/status')
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
            var resources=app.get('resources')
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
                    id:request.body.id
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

    app.post('/resources/planners/:planner/_check',function(request,response){
        var id=validate.toString(request.params.planner)
          , resources=app.get('resources')
          , planners=resources.planners
          , planner=get_element(id,planners)

        if(planner){
            test({
                planner:{
                    host:planner[1].planner.host+':'+
                         planner[1].planner.port
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
            response.status(404).json(_error.notfound)
        }
    });

    app.post('/resources/planners/:planner/_status',function(request,response){
        var id=validate.toString(request.params.planner)
          , resources=app.get('resources')
          , planners=resources.planners
          , planner=get_element(id,planners)

        if(planner){
            test({
                planner:{
                    host:planner[1].planner.host+':'+
                         planner[1].planner.port
                }
            })
            .then(status)
            .then(function(args){
                planners[planner[0]].status=args.status;
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
            response.status(404).json(_error.notfound)
        }
    });
};

/*
            .then(function(args){
                planners[planner[0]].status=args.status
                response.status(200).json(args);
            })

    app.post('/planners/:planner/_api',function(request,response){
        var id=validate.toString(request.params.planner)
          , planners=app.get('planners')
          , planner=get_planner(id,planners)

        if(planner){
            f.testplanner({
                host: planner[1].host+':'+
                      planner[1].port
            })
            .then(f.api)
            .then(function(args){
                planners[planner[0]].all_tasks=args.all_tasks;
                response.status(200).json(args.all_tasks);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(401).json(_error.auth);
                }else{
                    response.status(403).json(error);
                }
            })
            .done();
        }else{
            response.status(404).json(_error.notfound)
        }
    });

    app.post('/planners/:planner/_set',function(request,response){
        var id=validate.toString(request.params.planner)
          , planners=app.get('planners')
          , planner=get_planner(id,planners)

        if(planner){
            f.testplanner({
                host: planner[1].host+':'+
                      planner[1].port
              , task: request.body
            })
            .then(f.set)
            .then(function(args){
                planners[planner[0]].tid=args.tid;
                response.status(200).json(_success.ok);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(401).json(_error.auth);
                }else{
                    response.status(403).json(error);
                }
            })
            .done();
        }else{
            response.status(404).json(_error.notfound)
        }
    });

    app.post('/planners/:planner/_run',function(request,response){
        var id=validate.toString(request.params.planner)
          , planners=app.get('planners')
          , planner=get_planner(id,planners)

        if(planner){
            f.testplanner({
                host:  planner[1].host+':'+
                       planner[1].port
              , tid:   planner[1].tid
              , targs: request.body
            })
            .then(f.run)
            .then(function(args){
                planners[planner[0]].tid=args.tid;
                response.status(200).json(_success.ok);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(401).json(_error.auth);
                }else{
                    response.status(403).json(error);
                }
            })
            .done();
        }else{
            response.status(404).json(_error.notfound)
        }
    });

    app.post('/planners/:planner/_stop',function(request,response){
        var id=validate.toString(request.params.planner)
          , planners=app.get('planners')
          , planner=get_planner(id,planners)

        if(planner){
            f.testplanner({
                host:  planner[1].host+':'+
                       planner[1].port
              , tid:   planner[1].tid
              , targs: request.body
            })
            .then(f.stop)
            .then(function(args){
                planners[planner[0]].tid=args.tid;
                response.status(200).json(_success.ok);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(401).json(_error.auth);
                }else{
                    response.status(403).json(error);
                }
            })
            .done();
        }else{
            response.status(404).json(_error.notfound)
        }
    });

    app.delete('/planners/:planner/_remove',function(request,response){
        var id=validate.toString(request.params.planner)
          , planners=app.get('planners')
          , planner=get_planner(id,planners)

        if(planner){
            f.testplanner({
                host:  planner[1].host+':'+
                       planner[1].port
              , tid:   planner[1].tid
            })
            .then(f.remove)
            .then(function(args){
                delete planners[planner[0]].tid;
                response.status(200).json(_success.ok);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(401).json(_error.auth);
                }else{
                    response.status(403).json(error);
                }
            })
            .done();
        }else{
            response.status(404).json(_error.notfound)
        }
    });
*/

