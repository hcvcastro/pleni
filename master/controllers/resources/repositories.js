'use strict';

var validate=require('../../../planners/utils/validators')
  , _success=require('../../../planners/utils/json-response').success
  , _error=require('../../../planners/utils/json-response').error
  , test=require('../../../planners/functions/databases/test')
  , auth=require('../../../planners/functions/databases/auth')
  , infodb=require('../../../planners/functions/databases/infodb')
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
    app.get('/resources/repositories',function(request,response){
        response.json(app.get('resources').repositories.map(
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

    app.put('/resources/repositories',function(request,response){
        if(schema.js.validate(request.body,schema.repositories).length==0){
            var resources=app.get('resources')
            resources.repositories=request.body.map(function(repository){
                return {
                    id:validate.toString(repository.id)
                  , _dbserver:validate.toString(repository._dbserver)
                  , db:{
                        name:validate.toString(repository.db.name)
                    }
                };
            });

            app.set('resources',resources);
            response.status(201).json(_success.ok);
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/resources/repositories',function(request,response){
        if(schema.js.validate(request.body,schema.repository).length==0){
            var resources=app.get('resources')
              , repositories=resources.repositories
              , repository=get_element(request.body.id,repositories)

            if(!repository){
                var new_repository={
                    id:request.body.id
                  , _dbserver:request.body._dbserver
                  , db:{
                        name:validate.toString(request.body.db.name)
                    }
                };

                repositories.push(new_repository);
                resources.repositories=repositories;
                app.set('resources',resources);

                response.status(201).json(new_repository);
            }else{
                response.status(403).json(_error.notoverride);
            }
        }else{
            var a=schema.js.validate(request.body,schema.repository);
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/resources/repositories',function(request,response){
        var resources=app.get('resources')

        resources.repositories=[];
        app.set('resources',resources);
        response.status(200).json(_success.ok);
    });

    app.post('/resources/repositories/_check',function(request,response){
        if(schema.js.validate(request.body,schema.repository).length==0){
            var dbserver=get_element(
                request.body._dbserver,app.get('resources').dbservers);

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
                    var e=JSON.parse(error);
                    if(e.code=='ECONNREFUSED'){
                        response.status(404).json(_error.network);
                    }else if(e.error=='not_found'){
                        response.status(404).json(_error.network);
                    }else if(e.error=='unauthorized'){
                        response.status(401).json(_error.auth);
                    }
                })
                .done();
            }else{
                response.status(404).json(_error.network);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });
};

