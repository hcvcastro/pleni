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
        res.json({test:false});
        return;
    }

    // testing couchdb
    // TODO

    res.json({test:true});
}

