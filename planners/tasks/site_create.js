'use strict';

var validate=require('../utils/validators')
  , test=require('../functions/databases/test')
  , auth=require('../functions/databases/auth')
  , db=require('../functions/databases/create')
  , summary=require('../functions/repositories/sites/create/summary')
  , rootsite=require('../functions/repositories/sites/create/rootsite')
  , design=require('../functions/repositories/sites/create/documentdesign')

module.exports=function(params,repeat,stop){
    test(params)
    .then(auth)
    .then(db)
    .then(summary)
    .then(rootsite)
    .then(design)
    .then(function(args){
        console.log('RUN create --> '+args.db.name);
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
            db: {
                host:validate.toValidHost(args.host)
              , user:validate.toString(args.dbuser)
              , pass:validate.toString(args.dbpass)
              , name:validate.toString(args.dbname)
            }
          , site: {
                url: validate.toValidHost(args.site_url)
            }
        };
    }
};

/*module.exports.scheme={
    'host':{
        type:'string'
    }
  , 'dbuser':{
        type:'string'
    }
  , 'dbpass':{
        type:'string'
    }
  , 'dbname':{
        type:'string'
    }
  , 'site_url':{
        type:'string'
    }
};*/

