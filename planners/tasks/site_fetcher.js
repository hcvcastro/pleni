'use strict';

var f=require('./functions/couchdb')
  , g=require('./functions/sites_creator')
  , h=require('./functions/sites_fetcher')

module.exports=function(params,repeat,stop){
    f.testcouchdb(params)
    .then(f.couchdbauth)
    .then(h.getsitetask)
    .then(h.looksitetask)
    .then(h.getheadrequest)
    .then(h.getgetrequest)
    .then(h.bodyanalyzerlinks)
    .then(h.completesitetask)
    .then(h.spreadsitelinks)
    .fail(function(error){
        console.log(error);
        stop();
    })
    .done(function(args){
        console.log(args);
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

