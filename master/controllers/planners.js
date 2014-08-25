'use strict';

var validate=require('../../planners/utils/validators')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , f=require('../../planners/functions/planner')

module.exports=function(app){
    app.get('/planners/view',function(request,response){
        response.render('pages/planners');
    });

    app.get('/planners',function(request,response){
        var planners=app.get('planners')
          , filtered=new Array()

        for(var i in planners){
            filtered.push({
                id:   planners[i].id
              , host: planners[i].host
              , port: planners[i].port
            });
        }

        response.json(filtered);
    });

    app.put('/planners',function(request,response){
        var planners=new Array()

        for(var i in request.body){
            if(validate.validSlug(request.body[i].id)
                &validate.validHost(request.body[i].host)
                &validate.validPort(request.body[i].port)){
                planners.push({
                    id:   validate.toString(request.body[i].id)
                  , host: validate.toValidHost(request.body[i].host)
                  , port: validate.toInt(request.body[i].port)
                });
            }
        }

        app.set('planners',planners);
        response.status(201).json(_success.ok);
    });

    app.post('/planners',function(request,response){
        if(validate.validSlug(request.body.id)
            &validate.validHost(request.body.host)
            &validate.validPort(request.body.port)){

            var id=validate.toString(request.body.id)
              , planners=app.get('planners')
              , planner=get_planner(id,planners)
              , new_planner={
                    id:   id
                  , host: validate.toValidHost(request.body.host)
                  , port: validate.toInt(request.body.port)
                }

            if(!planner){
                planners.push(new_planner);
                app.set('planners',planners);
                response.status(201).json({
                    id:   new_planner.id
                  , host: new_planner.host
                  , port: new_planner.port
                });
            }else{
                response.status(403).json(_error.notoverride);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/planners',function(request,response){
        app.set('planners',[]);
        response.status(200).json(_success.ok);
    });

    app.post('/planners/_check',function(request,response){
        if(validate.validHost(request.body.host)
            &validate.validPort(request.body.port)){
            f.testplanner({
                host: validate.toValidHost(request.body.host)+':'+
                      validate.toInt(request.body.port)
            })
            .then(function(args){
                response.status(200).json(_success.ok);
            })
            .fail(function(error){
                response.status(404).json(_error.network);
            })
            .done();
        }else{
            response.status(403).json(_error.validation);
        }
    });

    var get_planner=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].id==needle){
                return [i,haystack[i]];
            }
        }
        return;
    };

    app.get('/planners/:planner',function(request,response){
        var id=validate.toString(request.params.planner)
          , planners=app.get('planners')
          , planner=get_planner(id,planners)

        if(planner){
            response.status(200).json({
                id:   planner[1].id
              , host: planner[1].host
              , port: planner[1].port
            });
            return;
        }

        response.status(404).json(_error.notfound);
    });

    app.put('/planners/:planner',function(request,response){
        if(validate.validSlug(request.params.planner)
            &validate.validHost(request.body.host)
            &validate.validPort(request.body.port)){
            var id=validate.toString(request.params.planner)
              , planners=app.get('planners')
              , planner=get_planner(id,planners)
              , new_planner={
                    id:   id
                  , host: validate.toValidHost(request.body.host)
                  , port: validate.toInt(request.body.port)
                }

            if(planner){
                planners[planner[0]]=new_planner;
                app.set('planners',planners);
                response.status(200).json({
                    id:   new_planner.id
                  , host: new_planner.host
                  , port: new_planner.port
                });
            }else{
                planners.push(new_planner);
                app.set('planners',planners);
                response.status(201).json({
                    id:   new_planner.id
                  , host: new_planner.host
                  , port: new_planner.port
                });
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/planners/:planner',function(request,response){
        var id=validate.toString(request.params.planner)
          , planners=app.get('planners')
          , planner=get_planner(id,planners)

        if(planner){
            delete planners[planner[0]];
            app.set('planners',planners);
            response.status(200).json(_success.ok);
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    app.post('/planners/:planner/_check',function(request,response){
        var id=validate.toString(request.params.planner)
          , planners=app.get('planners')
          , planner=get_planner(id,planners)

        if(planner){
            f.testplanner({
                host: planner[1].host+':'+
                      planner[1].port
            })
            .then(function(args){
                var _status=planners[planner[0]].tid==undefined
                  , _message=_status?'online':'taken'

                response.status(200).json({ok:true,status:_message});
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

    app.post('/planners/:planner/_status',function(request,response){
        var id=validate.toString(request.params.planner)
          , planners=app.get('planners')
          , planner=get_planner(id,planners)

        if(planner){
            f.testplanner({
                host: planner[1].host+':'+
                      planner[1].port
            })
            .then(f.status)
            .then(function(args){
                planners[planner[0]].status=args.status
                response.status(200).json(args);
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
};

