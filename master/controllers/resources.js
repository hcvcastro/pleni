'use strict';

var validate=require('../../planners/utils/validators')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , schemas={
        dbservers:{
            "$schema":"http://json-schema.org/draft-04/schema#"
          , "type":"array"
          , "items":{
                "type":"object"
              , "properties":{
                    "id":{
                        "type":"string"
                    }
                  , "db":{
                        "type":"object"
                      , "properties":{
                            "host":{
                                "type":"string"
                            }
                          , "port":{
                                "type":"string"
                            }
                          , "user":{
                                "type":"string"
                            }
                          , "pass":{
                                "type":"string"
                            }
                          , "prefix":{
                                "type":"string"
                            }
                        }
                      , "required":["host","port","user","pass","prefix"]
                    }
                }
              , "required":["id","db"]
            }
          , "minItems":1
          , "uniqueItems":true
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

        if(js.validate(request.body,schemas.dbservers)){
            var resources=app.get('resources')
            var list=new Array()

            for(var i in request.body){
                if(validate.validSlug(request.body[i].id)
                    &validate.validHost(request.body[i].host)
                    &validate.validPort(request.body[i].port)
                    &validate.validSlug(request.body[i].dbuser)
                    &validate.validSlug(request.body[i].prefix)){
                    list.push({
                        id:     validate.toString(request.body[i].id)
                      , host:   validate.toValidHost(request.body[i].host)
                      , port:   validate.toInt(request.body[i].port)
                      , dbuser: validate.toString(request.body[i].dbuser)
                      , dbpass: validate.toString(request.body[i].dbpass)
                      , prefix: validate.toString(request.body[i].prefix)
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
};

