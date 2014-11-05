'use strict';

var validate=require('../../utils/validators')
  , base='../../functions'
  , test=require(base+'/databases/test')
  , auth=require(base+'/databases/auth')
  , create=require(base+'/databases/create')
  , summary=require(base+'/repositories/sites/create/summary')
  , rootsite=require(base+'/repositories/sites/create/rootsite')
  , design=require(base+'/repositories/sites/create/designdocument')

/*
 * Task for creation of a repository of site
 * args input
 *      db
 *          host
 *          name
 *          user
 *          pass
 *      site
 *          url
 *
 * args output
 *      auth
 *          cookie
 *      site
 *          summary
 *          root
 *          design
 */
module.exports=function(params,repeat,stop){
    test(params)
    .then(auth)
    .then(create)
    .then(summary)
    .then(rootsite)
    .then(design)
    .then(function(args){
        console.log('RUN create --> '+args.db.name);
        stop();
    })
    .fail(function(error){
        console.log(error);
        stop();
    })
    .done();
};

module.exports.clean=function(args){
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

