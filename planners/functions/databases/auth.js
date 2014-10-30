'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for get a cookie session in couchdb server
 * args inputs
 *      db
 *          host
 *          user
 *          pass
 *
 * args outputs
 *      auth
 *          cookie
 */
exports.auth=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/_session'
      , body={
            name:args.db.user
          , password:args.db.pass
        }

    request.post({url:url,json:body},function(error,response){
        if(!error){
            if(response.statusCode==200){
                var regex=/^(.*); Version=1;.*$/i
                  , exec=regex.exec(response.headers['set-cookie'])
                
                args.auth.cookie=exec[1];
                deferred.resolve(args);
                return;
            }
            deferred.reject(response.body);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

