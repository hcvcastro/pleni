'use strict';

// validation of fields
var validator=require('validator')
  , validateHost=function(host){
    return (validator.isIP(host)||validator.isURL(host));
    }
  , validatePort=function(port){
    return (validator.isInt(port));
    }
  , validatePrefix=function(prefix){
    return prefix.match(/^[a-z][a-z0-9_]*$/i);
    };

exports.index=function(request,response){
    response.render('pages/settings',app.db);
};

exports.testdb=function(request,response){
    var host=request.body.host
      , port=request.body.port;

    // validation
    if(!validateHost(host)||!validatePort(port)){
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
            if(validator.isJSON(body)){
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
            }else{
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
};

exports.savedb=function(request,response){
    var host=request.body.host
      , port=request.body.port
      , suffix=request.body.suffix;

    // validation
    if(!validateHost(host)||!validatePort(port)||!validateSuffix(suffix)){
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
};

