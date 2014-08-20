'use strict';

var f=require('../functions/couchdb')
  , g=require('../functions/sites_creator')

module.exports=function(params,repeat,stop){
    f.testcouchdb(params)
    .then(f.couchdbauth)
    .then(f.createdb)
    .then(g.createsummary)
    .then(g.createrootsite)
    .then(g.createdesigndocument)
    .fail(function(error){
        console.log(error);
        stop();
    })
    .done(function(args){
        console.log('creator --> '+args['dbname'])
        repeat();
    });
};

module.exports.valid=function(args){
    var result=['host','dbuser','dbpass','dbname','site_url']
        .every(function(element){
            return args[element]!==undefined;
        });

    return result;
};

