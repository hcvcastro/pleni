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
        var repositories=request.body
          , result=true

        for(var i in repositories){
            result&=validate.validSlug(repositories[i].id)
                   &validate.validHost(repositories[i].host)
                   &validate.validPort(repositories[i].port)
                   &validate.validSlug(repositories[i].dbuser)
                   &validate.validSlug(repositories[i].prefix)
            ;
            if(result){
                repositories[i].id=
                    validate.toString(repositories[i].id);
                repositories[i].host=
                    validate.toValidHost(repositories[i].host);
                repositories[i].port=
                    validate.toInt(repositories[i].port);
                repositories[i].dbuser=
                    validate.toString(repositories[i].dbuser);
                repositories[i].dbpass=
                    validate.toString(repositories[i].dbpass);
                repositories[i].prefix=
                    validate.toString(repositories[i].prefix);
            }
        }
        
        if(result){
            app.set('repositories',repositories);
            response.status(202).json(_success.ok);
        }else{
            response.status(400).json(_error.validation);
        }
    });

    app.post('/repositories',function(request,response){
        var repository=request.body
          , result=validate.validSlug(repository.id)
                  &validate.validHost(repository.host)
                  &validate.validPort(repository.port)
                  &validate.validSlug(repository.dbuser)
                  &validate.validSlug(repository.prefix)

        if(result){
            repository.id=validate.toString(repository.id);
            repository.host=validate.toValidHost(repository.host);
            repository.port=validate.toInt(repository.port);
            repository.dbuser=validate.toString(repository.dbuser);
            repository.dbpass=validate.toString(repository.dbpass);
            repository.prefix=validate.toString(repository.prefix);

            var repositories = app.get('repositories');
            repositories[repository.id]={
                host:repository.host
              , port:repository.port
              , dbuser:repository.dbuser
              , dbpass:repository.dbpass
              , prefix:repository.prefix
            };
            app.set('repositories',repositories);
            response.status(202).json(_success.ok);
        }else{
            response.status(400).json(_error.validation);
        }
    });

    app.delete('/repositories',function(request,response){
        app.set('repositories',[]);
        response.status(200).json(_success.ok);
    });

    app.post('/repositories/_check',function(request,response){
        var repository=request.body
          , result=validate.validHost(repository.host)
                  &validate.validPort(repository.port)
                  &validate.validSlug(repository.dbuser)

        if(result){
            repository.host=validate.toValidHost(repository.host);
            repository.port=validate.toInt(repository.port);
            repository.dbuser=validate.toString(repository.dbuser);
            repository.dbpass=validate.toString(repository.dbpass);

            f.testcouchdb({
                host:repository.host+':'+repository.port
              , dbuser:repository.dbuser
              , dbpass:repository.dbpass
            })
            .then(f.couchdbauth)
            .then(function(args){
                response.status(200).json(_success.ok);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(403).json(_error.auth);
                }
            })
            .done();
        }else{
            response.status(400).json(_error.validation);
        }
    });

    app.get('/repositories/:repository',function(request,response){
        var repositories=app.get('repositories')
          , repository=validate.toString(request.params.repository)

        for(var i in repositories){
            if(repositories[i].id==repository){
                response.status(200).json({
                    id:     repositories[i].id
                  , host:   repositories[i].host
                  , port:   repositories[i].port
                  , prefix: repositories[i].prefix
                });
                return;
            }
        }

        response.status(404).json(_error.notfound)
    });

    app.put('/repositories/:repository',function(request,response){
        var repository=request.body
          , result=validate.validSlug(request.params.repository)
                  &validate.validHost(repository.host)
                  &validate.validPort(repository.port)
                  &validate.validSlug(repository.dbuser)
                  &validate.validSlug(repository.prefix)

        if(result){
            repository.host=validate.toValidHost(repository.host);
            repository.port=validate.toInt(repository.port);
            repository.dbuser=validate.toString(repository.dbuser);
            repository.dbpass=validate.toString(repository.dbpass);
            repository.prefix=validate.toString(repository.prefix);

            var repositories = app.get('repositories');
            repositories[request.params.repository]={
                host:repository.host
              , port:repository.port
              , dbuser:repository.dbuser
              , dbpass:repository.dbpass
              , prefix:repository.prefix
            };
            app.set('repositories',repositories);
            response.status(202).json(_success.ok);
        }else{
            response.status(400).json(_error.validation);
        }
    });

    app.delete('/repositories/:repository',function(request,response){
        var repositories=app.get('repositories')

        if(repositories[request.params.repository]){
            delete repositories[request.params.repository];
            app.set('repositories',repositories);
            response.status(200).json(_success.ok);
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    app.post('/repositories/:repository/_check',function(request,response){
        var repositories=app.get('repositories')
          , repository=validate.toString(request.params.repository)

        if(repositories[repository]){
            f.testcouchdb({
                host:repositories[repository].host+':'
                    +repositories[repository].port
              , dbuser:repositories[repository].dbuser
              , dbpass:repositories[repository].dbpass
            })
            .then(f.couchdbauth)
            .then(function(args){
                response.status(200).json(_success.ok);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(403).json(_error.auth);
                }
            })
            .done();
        }else{
            response.status(404).json(_error.notfound)
        }
    });
};

