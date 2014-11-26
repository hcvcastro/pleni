'use strict';

var validate=require('../../planners/utils/validators')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , test=require('../../planners/functions/databases/test')
  , auth=require('../../planners/functions/databases/auth')
  , list=require('../../planners/functions/databases/list')
  , infodbs=require('../../planners/functions/databases/infodbs')
  , pretty=require('prettysize')
  , schema=require('../utils/schema')
  , get_element=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].id==needle){
                return [i,haystack[i]];
            }
        }
        return;
    };

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
              , dbserver=get_element(request.body.id,dbservers)

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

    app.delete('/resources/dbservers',function(request,response){
        var resources=app.get('resources')

        resources.dbservers=[];
        app.set('resources',resources);
        response.status(200).json(_success.ok);
    });

    app.post('/resources/dbservers/_check',function(request,response){
        if(schema.js.validate(request.body,schema.dbserver).length==0){
            test({
                db:{
                    host:validate.toValidHost(request.body.db.host)+':'+
                         validate.toInt(request.body.db.port)
                  , user:validate.toString(request.body.db.user)
                  , pass:validate.toString(request.body.db.pass)
                }
            })
            .then(auth)
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

    app.get('/resources/dbservers/:dbserver',function(request,response){
        var id=validate.toString(request.params.dbserver)
          , dbservers=app.get('resources').dbservers
          , dbserver=get_element(id,dbservers)

        if(dbserver){
            response.status(200).json({
                id:dbserver[1].id
              , db:{
                    host:dbserver[1].db.host
                  , port:dbserver[1].db.port
                  , prefix:dbserver[1].db.prefix
                }
            });
            return;
        }

        response.status(404).json(_error.notfound);
    });

    app.put('/resources/dbservers/:dbserver',function(request,response){
        var id=validate.toString(request.params.dbserver)
          , resources=app.get('resources')
          , dbservers=resources.dbservers
          , dbserver=get_element(id,dbservers)

        if(schema.js.validate(request.body,schema.dbserver).length==0){
            var new_dbserver={
                id:id
              , db:{
                    host:validate.toValidHost(request.body.db.host)
                  , port:validate.toInt(request.body.db.port)
                  , user:validate.toString(request.body.db.user)
                  , pass:validate.toString(request.body.db.pass)
                  , prefix:validate.toString(request.body.db.prefix)
                }
            };

            if(dbserver){
                dbservers[dbserver[0]]=new_dbserver;
                response.status(200).json({
                    id:new_dbserver.id
                  , db:{
                        host:new_dbserver.db.host
                      , port:new_dbserver.db.port
                      , prefix:new_dbserver.db.prefix
                    }
                });
            }else{
                dbservers.push(new_dbserver);
                response.status(201).json({
                    id:new_dbserver.id
                  , db:{
                        host:new_dbserver.db.host
                      , port:new_dbserver.db.port
                      , prefix:new_dbserver.db.prefix
                    }
                });
            }

            resources.dbservers=dbservers;
            app.set('resources',resources);
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/resources/dbservers/:dbserver',function(request,response){
        var id=validate.toString(request.params.dbserver)
          , resources=app.get('resources')
          , dbservers=resources.dbservers
          , dbserver=get_element(id,dbservers)

        if(dbserver){
            delete dbservers[dbserver[0]];
            resources.dbservers=dbservers;
            app.set('resources',resources);
            response.status(200).json(_success.ok);
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    app.post('/resources/dbservers/:dbserver/_check',function(request,response){
        var id=validate.toString(request.params.dbserver)
          , resources=app.get('resources')
          , dbservers=resources.dbservers
          , dbserver=get_element(id,dbservers)

        if(dbserver){
            test({
                db:{
                    host:dbserver[1].db.host+':'+
                         dbserver[1].db.port
                  , user:dbserver[1].db.user
                  , pass:dbserver[1].db.pass
                }
            })
            .then(auth)
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

    app.post('/resources/dbservers/:dbserver/_databases',
        function(request,response){
        var id=validate.toString(request.params.dbserver)
          , resources=app.get('resources')
          , dbservers=resources.dbservers
          , dbserver=get_element(id,dbservers)

        if(dbserver){
            var prefix=dbserver[1].db.prefix;

            test({
                db:{
                    host:dbserver[1].db.host+':'+
                         dbserver[1].db.port
                  , user:dbserver[1].db.user
                  , pass:dbserver[1].db.pass
                  , prefix:prefix
                }
            })
            .then(auth)
            .then(list)
            .then(infodbs)
            .then(function(args){
                var refined=args.db.explist.map(function(element){
                    var regex=/([a-z0-9]+)_(.*)/i
                      , name=element.db_name.substring(prefix.length)
                      , match=regex.exec(name)

                    return {
                        name:match[2]
                      , type:match[1]
                      , params:{
                            db_name:element.db_name
                          , doc_count:element.doc_count
                          , disk_size:pretty(element.disk_size)
                          , data_size:pretty(element.data_size)
                          , update_seq:element.update_seq
                        }
                    }
                });
                response.status(200).json(refined);
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

