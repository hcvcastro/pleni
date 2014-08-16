'use strict';

var validate=require('../validators')
  , _success=require('../json-response').success
  , _error=require('../json-response').error
  , f=require('../../planners/functions/couchdb')

module.exports=function(app){
    app.get('/repositories/view',function(request,response){
        response.render('pages/repositories');
    });

    app.get('/repositories',function(request,response){
        var repositories=app.get('repositories')
          , filtered=new Array()

        for(var i in repositories){
            filtered.push({
                id:     repositories[i].id
              , host:   repositories[i].host
              , port:   repositories[i].port
              , prefix: repositories[i].prefix
            });
        }

        response.json(filtered);
    });

    app.put('/repositories',function(request,response){
        var repositories=new Array()

        for(var i in request.body){
            if(validate.validSlug(request.body[i].id)
                &validate.validHost(request.body[i].host)
                &validate.validPort(request.body[i].port)
                &validate.validSlug(request.body[i].dbuser)
                &validate.validSlug(request.body[i].prefix)){
                repositories.push({
                    id:     validate.toString(request.body[i].id)
                  , host:   validate.toValidHost(request.body[i].host)
                  , port:   validate.toInt(request.body[i].port)
                  , dbuser: validate.toString(request.body[i].dbuser)
                  , dbpass: validate.toString(request.body[i].dbpass)
                  , prefix: validate.toString(request.body[i].prefix)
                });
            }
        }

        app.set('repositories',repositories);
        response.status(201).json(_success.ok);
    });

    app.post('/repositories',function(request,response){
        var repositories=app.get('repositories')

        if(validate.validSlug(request.body.id)
            &validate.validHost(request.body.host)
            &validate.validPort(request.body.port)
            &validate.validSlug(request.body.dbuser)
            &validate.validSlug(request.body.prefix)){
            repositories.push({
                id:     validate.toString(request.body.id)
              , host:   validate.toValidHost(request.body.host)
              , port:   validate.toInt(request.body.port)
              , dbuser: validate.toString(request.body.dbuser)
              , dbpass: validate.toString(request.body.dbpass)
              , prefix: validate.toString(request.body.prefix)
            });

            app.set('repositories',repositories);
            response.status(201).json(_success.ok);
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/repositories',function(request,response){
        app.set('repositories',[]);
        response.status(200).json(_success.ok);
    });

    app.post('/repositories/_check',function(request,response){
        if(validate.validHost(request.body.host)
            &validate.validPort(request.body.port)
            &validate.validSlug(request.body.dbuser)){
            f.testcouchdb({
                host:   validate.toValidHost(request.body.host)+':'+
                        validate.toInt(request.body.port)
              , dbuser: validate.toString(request.body.dbuser)
              , dbpass: validate.toString(request.body.dbpass)
            })
            .then(f.couchdbauth)
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
            response.status(403).json(_error.validation);
        }
    });

    var get_repository=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].id==needle){
                return [i,haystack[i]];
            }
        }
        return;
    };

    app.get('/repositories/:repository',function(request,response){
        var id=validate.toString(request.params.repository)
          , repositories=app.get('repositories')
          , repository=get_repository(id,repositories)

        if(repository){
            response.status(200).json({
                id:     repository[1].id
              , host:   repository[1].host
              , port:   repository[1].port
              , prefix: repository[1].prefix
            });
            return;
        }

        response.status(404).json(_error.notfound);
    });

    app.put('/repositories/:repository',function(request,response){
        if(validate.validSlug(request.params.repository)
            &validate.validHost(request.body.host)
            &validate.validPort(request.body.port)
            &validate.validSlug(request.body.dbuser)
            &validate.validSlug(request.body.prefix)){
            var id=validate.toString(request.params.repository)
              , repositories=app.get('repositories')
              , repository=get_repository(id,repositories)
              , new_repository={
                    id:     id
                  , host:   validate.toValidHost(request.body.host)
                  , port:   validate.toInt(request.body.port)
                  , dbuser: validate.toString(request.body.dbuser)
                  , dbpass: validate.toString(request.body.dbpass)
                  , prefix: validate.toString(request.body.prefix)
                }

            if(repository){
                repositories[repository[0]]=new_repository;
                app.set('repositories',repositories);
                response.status(200).json(_success.ok);
            }else{
                repositories.push(new_repository);
                app.set('repositories',repositories);
                response.status(201).json(_success.ok);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/repositories/:repository',function(request,response){
        var id=validate.toString(request.params.repository)
          , repositories=app.get('repositories')
          , repository=get_repository(id,repositories)

        if(repository){
            delete repositories[repository[0]];
            app.set('repositories',repositories);
            response.status(200).json(_success.ok);
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    app.post('/repositories/:repository/_check',function(request,response){
        var id=validate.toString(request.params.repository)
          , repositories=app.get('repositories')
          , repository=get_repository(id,repositories)

        if(repository){
            f.testcouchdb({
                host:   repository[1].host+':'+
                        repository[1].port
              , dbuser: repository[1].dbuser
              , dbpass: repository[1].dbpass
            })
            .then(f.couchdbauth)
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

    app.post('/repositories/:repository/_databases',function(request,response){
        var id=validate.toString(request.params.repository)
          , repositories=app.get('repositories')
          , repository=get_repository(id,repositories)

        if(repository){
            f.testcouchdb({
                host:   repository[1].host+':'+
                        repository[1].port
              , dbuser: repository[1].dbuser
              , dbpass: repository[1].dbpass
            })
            .then(f.couchdbauth)
            .then(f.listdb)
            .then(function(args){
                var list=JSON.parse(args['all_dbs'])
                  , filter=list.filter(function(element){
                        return element.lastIndexOf(repository[1].prefix,0)===0
                    })
                response.status(200).json(filter);
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

