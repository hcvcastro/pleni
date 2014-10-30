'use strict';

var validate=require('../utils/validators')
  , test=require('../functions/databases/test')
  , auth=require('../functions/databases/auth')
  , wait=require('../functions/repositories/sites/fetch/getwaitdocument')
  , lock=require('../functions/repositories/sites/fetch/lockdocument')
  , head=require('../functions/repositories/sites/fetch/headrequest')
  , get=require('../functions/repositories/sites/fetch/getrequest')
  , body=require('../functions/repositories/sites/fetch/bodyanalyzer')
  , complete=require('../functions/repositories/sites/fetch/completedocument')
  , spread=require('../functions/repositories/sites/fetch/spreadrefs')

module.exports=function(params,repeat,stop){
    test(params)
    .then(auth)
    .then(wait)
    .then(lock)
    .then(head)
    .then(get)
    .then(body)
    .then(complete)
    .then(spread)
    .then(function(args){
        if(args.task.complete){
            console.log('RUN fetch --> '+args.task.complete.id);
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
    return {
        db: {
            host:validate.toValidHost(args.host)
          , user:validate.toString(args.dbuser)
          , pass:validate.toString(args.dbpass)
          , name:validate.toString(args.dbname)
        }
    };
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

