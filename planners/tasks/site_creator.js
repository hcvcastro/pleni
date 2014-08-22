'use strict';

var f=require('../functions/couchdb')
  , g=require('../functions/sites_creator')
  , validate=require('../utils/validators')

module.exports=function(params,repeat,stop){
    f.testcouchdb(params)
    .then(f.couchdbauth)
    .then(f.createdb)
    .then(g.createsummary)
    .then(g.createrootsite)
    .then(g.createdesigndocument)
    .then(function(args){
        console.log('RUN creator --> '+args['dbname']);
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
        &&validate.validSlug(args.dbname)
        &&validate.validHost(args.site_url)){

        return {
            host:     validate.toValidHost(args.host)
          , dbuser:   validate.toString(args.dbuser)
          , dbpass:   validate.toString(args.dbpass)
          , dbname:   validate.toString(args.dbname)
          , site_url: validate.toValidHost(args.site_url)
        };
    }
};

module.exports.args={
    host:''
  , dbuser:''
  , dbpass:''
  , dbname:''
  , site_url:''
};

