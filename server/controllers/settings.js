'use strict';

module.exports=function(app){
    app.get('/settings',function(request,response){
        response.render('pages/settings',global.app.db);
    });

    app.post('/settings/testdb',function(request,response){
        var validate=require('../validators')
          , host=request.body.host
          , port=request.body.port;

        // validation
        if(!validate.validHost(host)||!validate.validPort(port)){
            response.json({result:false,message:'Validation error'});
            return;
        }

        // testing couchdb
        var http=require('http')
          , options={
                host:host.replace(/.*?:\/\//g, ''),
                port:parseInt(port),
                path:'/',
            };

        http.get(options,function(res){
            res.setEncoding('utf8');
            res.on('data',function(body){
                try {
                    var obj=JSON.parse(body);
                    if('couchdb' in obj){
                        response.json({
                            result:true,
                            message:'Success connection',
                            version:obj.version
                        });
                    }else{
                        response.json({
                            result:false,
                            message:'JSON error'
                        });
                    }
                } catch (e) {
                    response.json({
                        result:false,
                        message:'Connection error'
                    });
                }
            });
        }).on('error',function(error){
            response.json({
                result:false,
                message:'Network error'
            });
        });
    });

    app.post('/settings/savedb',function(request,response){
        var validate=require('../validators')
          , host=request.body.host
          , port=request.body.port
          , prefix=request.body.prefix;

        // validation
        if(!validate.validHost(host)
            ||!validate.validPort(port)
            ||!validate.validSlug(prefix)){
            response.json({result:false,message:'Validation error'});
            return;
        }

        // write a database config
        var fs=require('fs')
          , path=require('path');

        var dbfile=path.join(__dirname,'..','database.json');
        var json={host:host,port:port,suffix:suffix};
        fs.writeFile(dbfile,JSON.stringify(json),
            function(err){
                if(err){throw err;}
                global.app.db=json;
        });

        response.json({result:true,message:'CouchDB settings changed'});
    });
};

