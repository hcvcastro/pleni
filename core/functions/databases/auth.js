'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for get a cookie session in couchdb server
 * args input
 *      db
 *          host
 *          user
 *          pass
 *
 * args output
 *      auth
 *          cookie
 *          ts
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/_session'
      , body={
            name:args.db.user
          , password:args.db.pass
        }

    if(!args.auth||!args.auth.cookie){
        if(args.debug){
            console.log('authentification in db server ... '+args.db.user);
        }
        request.post({url:url,json:body},function(error,response){
            if(!error){
                if(response.statusCode==200){
                    var auth=response.headers['set-cookie'].find(function(e){
                            return e.startsWith('AuthSession=');
                        })
                      , regex=/^(.*); .*$/i
                      , exec=regex.exec(auth)

                    if(!args.auth){
                        args.auth={};
                    }

                    args.auth.cookie=exec[1];
                    args.auth.ts=Date.now();
                    deferred.resolve(args);
                }else{
                    deferred.reject(response.body);
                }
            }else{
                deferred.reject(error);
            }
        });
    }else{
        deferred.resolve(args);
    }

    return deferred.promise;
};

