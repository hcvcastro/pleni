'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for getting a list of mimetypes in a site repository
 * args input
 *      db
 *          host
 *          name
 *      auth
 *          cookie
 *
 * args output
 *      site
 *          list
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name
      , view='/_design/sites/_view/mimetype?descending=false&group=true'
      , headers={
            'Cookie':args.auth.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    if(args.debug){
        console.log('get a mimetypes list');
    }
    request.get({url:url+view,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                var parse=JSON.parse(response.body);
                if(!parse.error){
                    if(!args.site){
                        args.site={};
                    }

                    args.site.list={};
                    for(var i=0;i<parse.rows.length;i++){
                        args.site.list[parse.rows[i].key]=parse.rows[i].value;
                    }

                    deferred.resolve(args);
                }else{
                    deferred.reject(response);
                }
            }else{
                deferred.reject(response);
            }
        }else{
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

