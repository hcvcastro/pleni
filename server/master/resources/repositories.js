'use strict';

var validate=require('../../../core/validators')
  , _success=require('../../../core/json-response').success
  , _error=require('../../../core/json-response').error
  , test=require('../../../core/functions/databases/test')
  , auth=require('../../../core/functions/databases/auth')
  , infodb=require('../../../core/functions/databases/infodb')
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

    app.get('/resources/repositories',authed,function(request,response){
        response.json(request.user.resources.repositories.map(
            function(repository){
                return {
                    id:repository.id
                  , _dbserver:repository._dbserver
                  , db:{
                        name:repository.db.name
                    }
                };
            }));
    });

    app.put('/resources/repositories',authed,function(request,response){
        if(schema.js.validate(request.body,schema.repositories).length==0){
            var resources=request.user.resources

            resources.repositories=request.body.map(function(repository){
                return {
                    id:validate.toString(repository.id)
                  , _dbserver:validate.toString(repository._dbserver)
                  , db:{
                        name:validate.toString(repository.db.name)
                    }
                };
            });

            request.user.save();
            response.status(201).json(_success.ok);
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/resources/repositories',authed,function(request,response){
        if(schema.js.validate(request.body,schema.repository).length==0){
            var resources=request.user.resources
              , repositories=resources.repositories
              , repository=get_element(request.body.id,repositories)

            if(!repository){
                var new_repository={
                    id:validate.toString(request.body.id)
                  , _dbserver:validate.toString(request.body._dbserver)
                  , db:{
                        name:validate.toString(request.body.db.name)
                    }
                };

                repositories.push(new_repository);
                request.user.save();

                response.status(201).json(new_repository);
            }else{
                response.status(403).json(_error.notoverride);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/resources/repositories',authed,function(request,response){
        var resources=request.user.resources

        resources.repositories=[];
        request.user.save();
        response.status(200).json(_success.ok);
    });

    app.post('/resources/repositories/_check',authed,function(request,response){
        if(schema.js.validate(request.body,schema.repository).length==0){
            var dbserver=get_element(
                request.body._dbserver,request.user.resources.dbservers);

            if(dbserver){
                test({
                    db:{
                        host:validate.toValidHost(dbserver[1].db.host)+':'+
                             validate.toInt(dbserver[1].db.port)
                      , user:validate.toString(dbserver[1].db.user)
                      , pass:validate.toString(dbserver[1].db.pass)
                      , name:validate.toString(request.body.db.name)
                    }
                })
                .then(auth)
                .then(infodb)
                .then(function(args){
                    response.status(200).json(_success.ok);
                })
                .fail(function(error){
                    if(error.code=='ECONNREFUSED'){
                        response.status(404).json(_error.network);
                    }else if(error.error=='not_found'){
                        response.status(404).json(_error.network);
                    }else if(error.error=='unauthorized'){
                        response.status(401).json(_error.auth);
                    }
                })
                .done();
            }else{
                response.status(404).json(_error.notfound);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.get('/resources/repositories/:repository',authed,
        function(request,response){
        var id=validate.toString(request.params.repository)
          , repositories=request.user.resources.repositories
          , repository=get_element(id,repositories)

        if(repository){
            response.status(200).json({
                id:repository[1].id
              , _dbserver:repository[1]._dbserver
              , db:{
                    name:repository[1].db.name
                }
            });
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    app.put('/resources/repositories/:repository',authed,
        function(request,response){
        var id=validate.toString(request.params.repository)
          , resources=request.user.resources
          , repositories=resources.repositories
          , repository=get_element(id,repositories)

        if(schema.js.validate(request.body,schema.repository).length==0){
            var new_repository={
                id:id
              , _dbserver:validate.toString(request.body._dbserver)
              , db:{
                    name:validate.toString(request.body.db.name)
                }
            };

            if(repository){
                repositories[repository[0]]=new_repository;
                response.status(200).json(new_repository);
            }else{
                repositories.push(new_repository);
                response.status(201).json(new_repository);
            }

            resources.repositories=repositories;
            request.user.save();
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/resources/repositories/:repository',authed,
        function(request,response){
        var id=validate.toString(request.params.repository)
          , resources=request.user.resources
          , repositories=resources.repositories
          , repository=get_element(id,repositories)

        if(repository){
            repositories.splice(repository[0],1);
            resources.repositories=repositories;
            request.user.save();

            response.status(200).json(_success.ok);
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    app.post('/resources/repositories/:repository/_check',authed,
        function(request,response){
        var id=validate.toString(request.params.repository)
          , resources=request.user.resources
          , repositories=resources.repositories
          , repository=get_element(id,repositories)

        if(repository){
            var dbserver=get_element(
                repository[1]._dbserver,resources.dbservers);

            if(dbserver){
                test({
                    db:{
                        host:dbserver[1].db.host+':'+
                             dbserver[1].db.port
                      , user:dbserver[1].db.user
                      , pass:dbserver[1].db.pass
                      , name:repository[1].db.name
                    }
                })
                .then(auth)
                .then(infodb)
                .then(function(args){
                    response.status(200).json(_success.ok);
                })
                .fail(function(error){
                    if(error.code=='ECONNREFUSED'){
                        response.status(404).json(_error.network);
                    }else if(error.error=='not_found'){
                        response.status(404).json(_error.network);
                    }else if(error.error=='unauthorized'){
                        response.status(401).json(_error.auth);
                    }
                })
                .done();
            }else{
                response.status(404).json(_error.notfound)
            }
        }else{
            response.status(404).json(_error.notfound)
        }
    });
};

