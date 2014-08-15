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
        var filtered=app.get('repositories');

        for(var a in filtered){
            delete filtered[a].dbuser;
            delete filtered[a].dbpass;
        }

        response.json(filtered);
    });

    app.put('/repositories',function(request,response){
        var repositories=request.body;
        var result=true;

        for(var i in repositories){
            result&=validate.validSlug(i)
                  &validate.validHost(repositories[i].host)
                  &validate.validPort(repositories[i].port)
                  &validate.validSlug(repositories[i].dbuser)
                  &validate.validSlug(repositories[i].prefix)
            ;
            if(result){
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
        var repository=request.body;

        var result=validate.validSlug(repository.id)
                  &validate.validHost(repository.host)
                  &validate.validPort(repository.port)
                  &validate.validSlug(repository.dbuser)
                  &validate.validSlug(repository.prefix)
        ;

        if(result){
            repository.id=validate.toString(repository.id);
            repository.host=validate.toValidHost(repository.host);
            repository.port=validate.toInt(repository.port);
            repository.dbuser=validate.toString(repository.dbuser);
            repository.dbpass=validate.toString(repository.dbpass);
            repository.prefix=validate.toString(repository.prefix);

            var id=repository.id;
            delete repository.id;

            var repositories = app.get('repositories');
            repositories.id=repository;
            app.set('repositories',repositories);

            response.status(202).json(_success.ok);
        }else{
            response.status(400).json(_error.validation);
        }
    });

    app.delete('/repositories',function(request,response){
        app.set('repositories',{});
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
        response.status(404).json(_error.notfound)
    });
};

