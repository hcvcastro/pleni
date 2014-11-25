'use strict';

var validate=require('../../planners/utils/validators')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , schema=require('../utils/schema')

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
        if(schema.js.validate(request.body,schema.dbservers).length==0){
            var resources=app.get('resources')
              , list=new Array()

            for(var i in request.body){
                list.push({
                    id:validate.toString(request.body[i].id)
                  , db:{
                        host:validate.toValidHost(request.body[i].db.host)
                      , port:validate.toInt(request.body[i].db.port)+''
                      , user:validate.toString(request.body[i].db.user)
                      , pass:validate.toString(request.body[i].db.pass)
                      , prefix:validate.toString(request.body[i].db.prefix)
                    }
                });
            }
            
            resources.dbservers=list
            app.set('resources',resources);
            response.status(201).json(_success.ok);
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/resources/dbservers',function(request,response){
        if(schema.js.validate(request.body,schema.dbserver).length==0){
            var resources=app.get('resources')
              , dbservers=resources.dbservers
              , dbserver=get_repository(request.body.id,dbservers)

            if(!dbserver){
                var new_dbserver={
                    id:request.body.id
                  , db:{
                        host:validate.toValidHost(request.body.db.host)
                      , port:validate.toInt(request.body.db.port)+''
                      , user:validate.toString(request.body.db.user)
                      , pass:validate.toString(request.body.db.pass)
                      , prefix:validate.toString(request.body.db.prefix)
                    }
                };

                dbservers.push(new_dbserver);
                resources.dbservers=dbservers;
                app.set('resources',resources);

                response.status(201).json({
                    id:new_dbserver.id
                  , db:{
                        host:new_dbserver.db.host
                      , port:new_dbserver.db.port
                      , prefix:new_dbserver.db.prefix
                    }
                });
            }else{
                response.status(403).json(_error.notoverride);
            }
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
        return null;
    };

};

