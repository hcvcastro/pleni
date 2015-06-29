'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for get a cookie session in planner server
 * args input
 *      planner
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
      , url=args.planner.host+'/_session'
      , body={
            name:args.planner.user
          , password:args.planner.pass
        }

    if(!args.auth || !args.auth.cookie){
        if(args.debug){
            console.log('authentification in planner server ...'+
                args.planner.user);
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
}

