'use strict';

var validate=require('../../utils/validators')
  , base='../../functions'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
  , wait=require(base+'/repositories/sites/fetch/getwaitdocument')
  , lock=require(base+'/repositories/sites/fetch/lockdocument')
  , head=require(base+'/repositories/sites/fetch/headrequest')
  , get=require(base+'/repositories/sites/fetch/getrequest')
  , body=require(base+'/repositories/sites/fetch/bodyanalyzer')
  , complete=require(base+'/repositories/sites/fetch/completedocument')
  , spread=require(base+'/repositories/sites/fetch/spreadrefs')

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

