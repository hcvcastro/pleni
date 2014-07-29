'use strict';

exports.index=function(req,res){
    res.render('pages/settings',app.db);
};

exports.testdb=function(req,res){
    console.log(req.body);
    res.json({test:true});
}

