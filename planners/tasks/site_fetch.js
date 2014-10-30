'u  e strict';

var f=require('../functions/couchdb')
  , g=require('../functions/sites_fetcher')
  , validate=require('../utils/validators')

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
    .then(function(args){
        if(args.complete_task){
            console.log('RUN fetch --> '+args['complete_task'].id);
        }
        repeat();
    })
    .fail(function(error){
        console.log(error);
        stop();
    })
    .done();
};

module.exports.cleanargs=function(args){
    if(validate.validHost(args.host)
        &&validate.validSlug(args.dbuser)
        &&validate.validSlug(args.dbname)){

    var result=['host','dbuser','dbpass','dbname']
        return {
            host:   validate.toValidHost(args.host)
          , dbuser: validate.toString(args.dbuser)
          , dbpass: validate.toString(args.dbpass)
          , dbname: validate.toString(args.dbname)
        };
    }
};

module.exports.scheme={
    host:{
        type:'string'
    }
  , dbuser:{
        type:'string'
    }
  , dbpass:{
        type:'string'
    }
  , dbname:{
        type:'string'
    }
};

