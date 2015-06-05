'use strict';

var validate=require('../../../core/validators')
  , _success=require('../../../core/json-response').success
  , _error=require('../../../core/json-response').error
  , pretty=require('prettysize')
  , schema=require('../../../core/schema')
  , test=require('../../../core/functions/databases/test')
  , auth=require('../../../core/functions/databases/auth')
  , list=require('../../../core/functions/databases/list')
  , infodbs=require('../../../core/functions/databases/infodbs')
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

    app.get('/resources/dbservers',authed,function(request,response){
        response.json(request.user.resources.dbservers
        .filter(function(dbserver){
            return Boolean(dbserver.attrs.readable)
        })
        .map(function(dbserver){
            return {
                id:dbserver.id
              , type:(dbserver.attrs.virtual?'virtual':'real')
              , readonly:!Boolean(dbserver.attrs.writeable)
              , db:{
                    host:dbserver.db.host
                  , port:dbserver.db.port
                  , prefix:dbserver.db.prefix
                }
            };
        }));
    });

    app.put('/resources/dbservers',authed,function(request,response){
        if(schema.js.validate(request.body,schema.dbservers).length==0){
            var resources=request.user.resources

            resources.dbservers=resources.dbservers.filter(function(dbserver){
                return !(Boolean(dbserver.attrs.readable))||
                       !(Boolean(dbserver.attrs.writable));
            });

            resources.dbservers=resources.dbservers.concat(request.body.map(
            function(dbserver){
                return {
                    id:validate.toString(dbserver.id)
                  , attrs:{
                        virtual:(dbserver.type=='virtual')
                      , readable:true
                      , writable:true
                    }
                  , db:{
                        host:validate.toValidHost(dbserver.db.host)
                      , port:validate.toInt(dbserver.db.port)
                      , user:validate.toString(dbserver.db.user)
                      , pass:validate.toString(dbserver.db.pass)
                      , prefix:validate.toString(dbserver.db.prefix)
                    }
                };
            }));

            request.user.save();
            response.status(201).json(_success.ok);
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/resources/dbservers',authed,function(request,response){
        if(schema.js.validate(request.body,schema.dbserver).length==0){
            var resources=request.user.resources
              , dbservers=resources.dbservers
              , dbserver=get_element(request.body.id,dbservers)

            if(!dbserver){
                var new_dbserver={
                    id:validate.toString(request.body.id)
                  , attrs:{
                        virtual:(request.body.type=='virtual')
                      , readable:true
                      , writable:true
                    }
                  , db:{
                        host:validate.toValidHost(request.body.db.host)
                      , port:validate.toInt(request.body.db.port)
                      , user:validate.toString(request.body.db.user)
                      , pass:validate.toString(request.body.db.pass)
                      , prefix:validate.toString(request.body.db.prefix)
                    }
                };

                dbservers.push(new_dbserver);

                request.user.save();
                response.status(201).json({
                    id:new_dbserver.id
                  , type:(new_dbserver.attrs.virtual?'virtual':'real')
                  , readonly:!Boolean(new_dbserver.attrs.writeable)
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

    app.delete('/resources/dbservers',authed,function(request,response){
        var resources=request.user.resources

        resources.dbservers=resources.dbservers.filter(function(dbserver){
            return !(Boolean(dbserver.attrs.readable))||
                   !(Boolean(dbserver.attrs.writable));
        });

        request.user.save();
        response.status(200).json(_success.ok);
    });

    app.post('/resources/dbservers/_check',authed,function(request,response){
        if(schema.js.validate(request.body,schema.dbserver).length==0){
            var packet={
                    db:{
                        host:validate.toValidHost(request.body.db.host)+':'+
                             validate.toInt(request.body.db.port)
                      , user:validate.toString(request.body.db.user)
                      , pass:validate.toString(request.body.db.pass)
                    }
                }

            if(request.body.type=='virtual'){
                packet.db.host+='/dbserver';
            }

            test(packet)
            .then(auth)
            .then(function(args){
                response.status(200).json(_success.ok);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else{
                    response.status(401).json(_error.auth);
                }
            })
            .done();
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.get('/resources/dbservers/:dbserver',authed,function(request,response){
        var id=validate.toString(request.params.dbserver)
          , resources=request.user.resources
          , dbservers=resources.dbservers
          , dbserver=get_element(id,dbservers)

        if(dbserver){
            response.status(200).json({
                id:dbserver[1].id
              , type:(dbserver[1].attrs.virtual?'virtual':'real')
              , readonly:!Boolean(dbserver[1].attrs.writeable)
              , db:{
                    host:dbserver[1].db.host
                  , port:dbserver[1].db.port
                  , prefix:dbserver[1].db.prefix
                }
            });
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    app.put('/resources/dbservers/:dbserver',authed,function(request,response){
        var id=validate.toString(request.params.dbserver)
          , resources=request.user.resources
          , dbservers=resources.dbservers
          , dbserver=get_element(id,dbservers)

        if(schema.js.validate(request.body,schema.dbserver).length==0){
            var new_dbserver={
                id:id
              , attrs:{
                    virtual:(request.body.type=='virtual')
                  , readable:true
                  , writable:true
                }
              , db:{
                    host:validate.toValidHost(request.body.db.host)
                  , port:validate.toInt(request.body.db.port)
                  , user:validate.toString(request.body.db.user)
                  , pass:validate.toString(request.body.db.pass)
                  , prefix:validate.toString(request.body.db.prefix)
                }
            };

            if(dbserver){
                if(dbserver[1].attrs.readable&&dbserver[1].attrs.writable){
                    dbservers[dbserver[0]]=new_dbserver;
                    response.status(200).json({
                        id:new_dbserver.id
                      , type:(new_dbserver.attrs.virtual?'virtual':'real')
                      , readonly:!Boolean(new_dbserver.attrs.writeable)
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
                dbservers.push(new_dbserver);
                response.status(201).json({
                    id:new_dbserver.id
                  , type:(new_dbserver.attrs.virtual?'virtual':'real')
                  , readonly:!Boolean(new_dbserver.attrs.writeable)
                  , db:{
                        host:new_dbserver.db.host
                      , port:new_dbserver.db.port
                      , prefix:new_dbserver.db.prefix
                    }
                });
            }

            resources.dbservers=dbservers;
            request.user.save();
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/resources/dbservers/:dbserver',authed,
        function(request,response){
        var id=validate.toString(request.params.dbserver)
          , resources=request.user.resources
          , dbservers=resources.dbservers
          , dbserver=get_element(id,dbservers)

        if(dbserver){
            if(dbserver[1].attrs.readable&&dbserver[1].attrs.writable){
                dbservers.splice(dbserver[0],1);
                resources.dbservers=dbservers;
                request.user.save();

                response.status(200).json(_success.ok);
            }else{
                response.status(403).json(_error.notoverride);
            }
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    app.post('/resources/dbservers/:dbserver/_check',authed,
        function(request,response){
        var id=validate.toString(request.params.dbserver)
          , resources=request.user.resources
          , dbservers=resources.dbservers
          , dbserver=get_element(id,dbservers)

        if(dbserver){
            var packet={
                    db:{
                        host:dbserver[1].db.host+':'+
                             dbserver[1].db.port
                      , user:dbserver[1].db.user
                      , pass:dbserver[1].db.pass
                    }
                }

            if(dbserver[1].attrs.virtual){
                packet.db.host+='/dbserver';
            }

            test(packet)
            .then(auth)
            .then(function(args){
                response.status(200).json(_success.ok);
            })
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else{
                    response.status(401).json(_error.auth);
                }
            })
            .done();
        }else{
            response.status(404).json(_error.notfound)
        }
    });

    app.post('/resources/dbservers/:dbserver/_databases',authed,
        function(request,response){
        var id=validate.toString(request.params.dbserver)
          , resources=request.user.resources
          , dbservers=resources.dbservers
          , dbserver=get_element(id,dbservers)

        if(dbserver){
            var prefix=dbserver[1].db.prefix

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
                response.status(200).json(args.db.explist.map(
                    function(element){
                        return {
                            name:element.db_name.substring(prefix.length)
                          , params:{
                                db_name:element.db_name
                              , doc_count:element.doc_count
                              , disk_size:pretty(element.disk_size)
                              , data_size:pretty(element.data_size)
                              , update_seq:element.update_seq
                            }
                        };
                    }));
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

