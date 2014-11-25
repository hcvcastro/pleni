'use strict';

var validate=require('../../planners/utils/validators')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , schemas={
        dbserver:{
            'type':'object'
          , 'properties':{
                'id':{
                    'type':'string'
                }
              , 'db':{
                    'type':'object'
                  , 'properties':{
                        'host':{
                            'type':'string'
                        }
                      , 'port':{
                            'type':'string'
                        }
                      , 'user':{
                            'type':'string'
                        }
                      , 'pass':{
                            'type':'string'
                        }
                      , 'prefix':{
                            'type':'string'
                        }
                    }
                  , 'required':['host','port','user','pass','prefix']
                }
            }
          , 'required':['id','db']
        }
      , dbservers:{
            '$schema':'http://json-schema.org/draft-04/schema#'
          , 'type':'array'
          , 'items':schemas.dbserver
          , 'minItems':1
          , 'uniqueItems':true
        }
    }

module.exports=function(app){
    app.get('/resources/view',function(request,response){
        response.render('pages/resources');
    });

    app.get('/resources/dbservers',function(request,response){
        var dbservers=app.get('resources').dbservers
          , filtered=new Array()

        for(var i in dbservers){
            filtered.push({
                id:dbservers[i].id
              , db:{
                    host:dbservers[i].db.host
                  , port:dbservers[i].db.port
                  , user:dbservers[i].db.user
                  , prefix:dbservers[i].db.prefix
                }
            });
        }

        response.json(filtered);
    });

    app.put('/resources/dbservers',function(request,response){
        var jayschema=require('jayschema')
          , js=new jayschema()

        if(js.validate(request.body,schemas.dbservers).length==0){
            var resources=app.get('resources')
              , list=new Array()

            for(var i in request.body){
                if(validate.validSlug(request.body[i].id)
                    &validate.validHost(request.body[i].db.host)
                    &validate.validPort(request.body[i].db.port)
                    &validate.validSlug(request.body[i].db.user)
                    &validate.validSlug(request.body[i].db.prefix)){
                    list.push({
                        id:validate.toString(request.body[i].id)
                      , db:{
                            host:validate.toValidHost(request.body[i].db.host)
                          , port:validate.toInt(request.body[i].db.port)
                          , user:validate.toString(request.body[i].db.user)
                          , pass:validate.toString(request.body[i].db.pass)
                          , prefix:validate.toString(request.body[i].db.prefix)
                        }
                    });
                }
            }
            
            resources.dbservers=list
            app.set('resources',resources);
            response.status(201).json(_success.ok);
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/resources/dbservers',function(request,response){
        var jayschema=require('jayschema')
          , js=new jayschema()

        if(js.validate(request.body,schemas.dbserver).length==0){
            var resources=app.get('resources')
              , id=validate.toString(request.body.id)
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

            if(!repository){
                repositories.push(new_repository);
                app.set('repositories',repositories);
                response.status(201).json({
                    id:     new_repository.id
                  , host:   new_repository.host
                  , port:   new_repository.port
                  , prefix: new_repository.prefix
                });
            }else{
                response.status(403).json(_error.notoverride);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });
};

