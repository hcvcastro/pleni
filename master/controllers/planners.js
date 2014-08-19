'use strict';

var validate=require('../validators')
  , _success=require('../json-response').success
  , _error=require('../json-response').error
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
                response.status(200).json(_success.ok);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(401).json(_error.auth);
                }
            })
            .done();
        }else{
            response.status(404).json(_error.notfound)
        }
    });

    app.put('/planners/:planner/_take',function(request,response){
        var id=validate.toString(request.params.planner)
          , planners=app.get('planners')
          , planner=get_planner(id,planners)

        if(planner){
            f.testplanner({
                host: planner[1].host+':'+
                      planner[1].port
            })
            .then(f.take)
            .then(function(args){
                planners[planner[0]].tid=args.tid;
                response.status(200).json(_success.ok);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(401).json(_error.auth);
                }
            })
            .done();
        }else{
            response.status(404).json(_error.notfound)
        }
    });

    app.delete('/planners/:planner/_loose',function(request,response){
        var id=validate.toString(request.params.planner)
          , planners=app.get('planners')
          , planner=get_planner(id,planners)

        if(planner){
            f.testplanner({
                host: planner[1].host+':'+
                      planner[1].port
              , tid:  planner[1].tid
            })
            .then(f.loose)
            .then(function(args){
                response.status(200).json(_success.ok);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(401).json(_error.auth);
                }
            })
            .done();
        }else{
            response.status(404).json(_error.notfound)
        }
    });
};
