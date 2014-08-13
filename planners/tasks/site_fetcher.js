'use strict';

var f=require('../functions/couchdb')
  , g=require('../functions/sites_fetcher')

module.exports=function(params,repeat,stop){
    f.testcouchdb(params)
    .then(f.couchdbauth)
    .then(g.getsitetask)
    .then(g.looksitetask)
    .then(g.getheadrequest)
    .then(g.getgetrequest)
    .then(g.bodyanalyzerlinks)
    .then(g.completesitetask)
    .then(g.spreadsitelinks)
    .fail(function(error){
        console.log(error);
        stop();
    })
    .done(function(args){
        console.log('fetcher --> '+args['complete_task'].id)
        repeat();
    });
};

module.exports.valid=function(args){
    var result=['host','dbuser','dbpass','dbname']
        .every(function(element){
            return args[element]!==undefined;
        });

    return result;
};

