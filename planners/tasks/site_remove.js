'use strict';

var validate=require('../utils/validators')
  , test=require('../functions/databases/test')
  , auth=require('../functions/databases/auth')
  , remove=require('../functions/databases/remove')

module.exports=function(params,repeat,stop){
    test(params)
    .then(auth)
    .then(remove)
    .then(function(args){
        console.log('RUN remove --> '+args.db.name);
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
