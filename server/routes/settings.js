'use strict';

exports.index=function(req,res){
    res.render('pages/settings',app.db);
};

exports.testdb=function(req,res,next){
    var host=req.body.host;
    var port=req.body.port;

    // validation
    var validator=require('validator');
    if((!validator.isIP(host)&&!validator.isURL(host))||!validator.isInt(port)){
        res.json({
            test:false,
            message:'Validation error'
        });
        return;
    }

    // testing couchdb
    require('http').get({
        host:host.replace(/.*?:\/\//g, ""),
        port:port,
        path:'/'
    },function(res2){
        res2.setEncoding('utf8')
        res2.on('data',function(body){
            if(validator.isJSON(body)){
                var obj=JSON.parse(body);
                if('couchdb' in obj){
                    res.json({
                        test:true,
                        message:'Success connection',
                        version:obj.version
                    });
                }else{
                    res.json({
                        test:false,
                        message:'JSON error'
                    });
                }
            }else{
                res.json({
                    test:false,
                    message:'Connection error'
                });
            }
        });
    }).on('error',function(error){
        res.json({
            test:false,
            message:'Network error'
        });
    });
};

